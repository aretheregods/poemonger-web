import { Hono } from "hono";
import { html } from "hono/html";
import { Base } from "./Base";
import { Activate } from "./components/emails";
import SignUp from "./components/signup";
import Hashes from "./utils/hash";

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
                <link
                    rel="stylesheet"
                    href="/static/styles/credentialsForm.css"
                />,
                <script
                    type="module"
                    src="/static/js/signup/index.js"
                    defer
                ></script>,
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
                }),
                {
                    metadata: {
                        hash: password,
                        created_at: n,
                        active: false,
                        token,
                        salt,
                    },
                }
            );
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
                    subject:
                        "Poetry is waiting. Finish activating your account.",
                    content: [
                        {
                            type: "text/html",
                            value: (
                                <Activate
                                    email={email}
                                    token={token}
                                    url={c.req.url}
                                />
                            ),
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

app.get("/activate", (c) => {
    const e = c.req.query("email");
    const t = c.req.query("token");
    return c.html(<h1>Activate</h1>);
});

app.get("/", (c) => {
    const props = {
        title: "Poemonger",
        children: <h1>Hello, Poemonger</h1>,
    };
    return c.html(<Base {...props} />);
});

export default app;
