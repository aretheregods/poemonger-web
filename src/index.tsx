import { Hono } from "hono";
import { Base } from "./Base";
import SignUp from "./components/signup";

import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

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

  var l = await c.env.USERS_KV.list({ prefix: `user=${email}` });
  if (l.keys.length) {
    message = `${messages.exists} ${JSON.stringify(l)}`;
    c.status(409);
  } else {
    await c.env.USERS_KV.put(
      `user=${email};created_at=${n}`,
      JSON.stringify({
        email: email,
        password: password,
        first_name: first_name,
        last_name: last_name,
      }),
      { metadata: { hash: password } }
    )
      .then(() =>
        mailChannelsPlugin({
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
          respondWith() {
            return c.json({ message: message + ` ${email}` });
          },
        })
      )
      .catch((e) => {
        message = `${messages.error} ${e}`;
        c.status(500);
      });
  }

  return c.json({ message });
});

app.get("/", (c) => {
  const props = {
    title: "Poemonger",
    children: <h1>Hello, Poemonger</h1>,
  };
  return c.html(<Base {...props} />);
});

export default app;
