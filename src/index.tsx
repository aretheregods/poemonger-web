import { Hono } from "hono";
import { html } from "hono/html";
import { Base } from "./Base";
import { Activate } from "./components/emails";
import ActivatePage from "./components/signup/ActivatePage";
import SignUp from "./components/signup";
import Hashes from "./utils/hash";
import Login from "./components/login";
import Logout from "./components/logout";
import Reset from "./components/reset";
import Delete from "./components/reset";

type Bindings = {
  USERS_KV: KVNamespace;
  DKIM_PRIVATE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/signup", (c) => {
  return c.html(
    <Base
      title="Poemonger | Sign Up"
      assets={[
        <link rel="stylesheet" href="/static/styles/credentialsForm.css" />,
        <script type="module" src="/static/js/signup/index.js" defer></script>,
      ]}
    >
      <SignUp />
    </Base>
  );
});

app.post("/signup", async (c) => {
  var n = Date.now();
  var ct = c.req.header("Content-Type");
  var f = /multipart\/form-data/g.test(ct || "");
  var messages = {
    success: `Successfully processed your.`,
    failure: `Could not process your request. Please send a form.`,
    error: "There was a problem saving your information. Please try again.",
    exists: "There is already an account with this email address.",
  };

  c.status(201);

  var message = messages.success;
  if (!f) {
    message = messages.failure;
    c.status(406);
  }

  var d = await c.req.formData();

  var email = d.get("email");
  var password = d.get("password");
  var first_name = d.get("first_name");
  var last_name = d.get("last_name");
  var salt = d.get("salt");

  var l = await c.env.USERS_KV.list({ prefix: `user=${email}` });
  if (l.keys.length) {
    message = `${messages.exists} ${JSON.stringify(l)}`;
    c.status(409);
  } else {
    try {
      const token = await Hashes.Hash256(email as string);
      await c.env.USERS_KV.put(
        `user=${email}`,
        JSON.stringify({
          email: email,
          password: password,
          first_name: first_name,
          last_name: last_name,
          hash: password,
          created_at: n,
          active: false,
          token,
          salt,
        })
      );
      const location = new URL(c.req.url);
      const host = location.hostname;
      const req = new Request("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [
                {
                  name: `${first_name} ${last_name}`,
                  email: email,
                },
              ],
              dkim_domain: "poemonger.com",
              dkim_selector: "mailchannels",
              dkim_private_key: c.env.DKIM_PRIVATE_KEY,
            },
          ],
          from: {
            name: "Poemonger | Welcome",
            email: "welcome@poemonger.com",
          },
          subject: "Poetry is waiting. Finish activating your account.",
          content: [
            {
              type: "text/html",
              value: ` <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta
                    http-equiv="Content-Type"
                    content="text/html; charset=UTF-8"
                />
            </head>

            <body>
                <main>
                <table>
                <thead>
                    <tr>
                        <td>
                            <h1>Welcome to POEMONGER</h1>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            Finish signing up.{" "}
                            <span>
                                <a
                                    href="${`https://${host}/activate?user=${email}&token=${token}`}"
                                >
                                    Activate your account
                                </a>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
                </main>
            </body>
        </html>`,
            },
          ],
        }),
      });
      const res = await fetch(req);
      var m = {};
      if (res.status === 202 || /accepted/i.test(res.statusText)) {
        m = { success: true };
      } else {
        try {
          const { errors } = (await res.clone().json()) as {
            errors: Array<object>;
          };
          m = { success: false, errors };
        } catch {
          m = { success: false, errors: [res.statusText] };
        }
      }

      return c.json(m);
    } catch (e) {
      message = `${messages.error} ${e}`;
      c.status(500);
    }
  }

  return c.json({ message });
});

app.get("/activate", async (c) => {
  const e = c.req.query("email");
  const t = c.req.query("token");
  var error = false;
  if (!e || !t) error = true;
  try {
    const value = await c.env.USERS_KV.get<{
      token: string;
    }>(`user=${e}`, { type: 'json' });
    
    if (!value || value?.token != t) error = true;
    else {
      await c.env.USERS_KV.put(
        `user=${e}`,
        JSON.stringify({ ...value, active: true })
      );
      error = false;
    }
  } catch {
    error = true;
  }

  return c.html(<ActivatePage error={error} />);
});

app.get("/login", (c) => {
  return c.html(
    <Base
      title="Poemonger | Login"
      assets={[
        <link rel="stylesheet" href="/static/styles/credentialsForm.css" />,
        <script type="module" src="/static/js/login/index.js" defer></script>,
      ]}
    >
      <Login />
    </Base>
  );
});

app.post("/login/check-email", async (c) => {
  var salt;
  var error;
  var status = 201;
  var body = await c.req.json();
  if (!body.email)
    return c.json({ error: "No email in request", salt }, { status: 404 });
  try {
    const value = await c.env.USERS_KV.get<{
        active: boolean;
        salt: string;
    }>(`user=${body.email}`, { type: 'json' });
    
    if (value?.active) salt = value?.salt;
    else {
      error = "Activate your account first. Click our link in your email";
      status = 404;
    }
  } catch (e) {
    error = `This email doesn't exist in our system - ${e}`;
    status = 404;
  }
  return c.json({ salt, error }, { status });
});

app.post("/login", (c) => {
  return c.json({});
});

app.get("/logout", (c) => {
  return c.html(
    <Base title="Poemonger | Logout">
      <Logout />
    </Base>
  );
});

app.get("/reset", (c) => {
  return c.html(
    <Base title="Poemonger | Reset">
      <Reset />
    </Base>
  );
});

app.get("/delete", (c) => {
  return c.html(
    <Base title="Poemonger | Delete">
      <Delete />
    </Base>
  );
});

app.get("/", (c) => {
  const props = {
    title: "Poemonger",
    children: <h1>Hello, Poemonger</h1>,
  };
  return c.html(<Base {...props} />);
});

export default app;
