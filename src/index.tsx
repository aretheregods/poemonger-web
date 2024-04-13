import { Hono } from "hono";
import { html } from "hono/html";
import { Base } from "./Base";
import Email, { Activate } from "./components/emails";
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
            const H = new Hashes();
            const token = await H.Hash256(email as string);
            const hash = await H.HashPasswordWithSalt(password as string, n);
            await c.env.USERS_KV.put(
                `user=${email}`,
                JSON.stringify({
                    email: email,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    created_at: n,
                    active: false,
                    hash,
                    token,
                    salt,
                })
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
                    subject: "Poetry is waiting. Finish activating your account.",
                    content: [
                        {
                            type: "text/html",
                            value: Email({
                                children: Activate({ email, token, url: c.req.url }),
                            }),
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
    const e = c.req.query("user");
    const t = c.req.query("token");
    var error = false;
    if (!e || !t) error = true;
    else {
        try {
            const value = await c.env.USERS_KV.get<{
                token: string;
            }>(`user=${e}`, { type: "json" });

            if (!value || value?.token != t) error = true;
            else {
                try {
                    await c.env.USERS_KV.put(
                        `user=${e}`,
                        JSON.stringify({ ...value, active: true })
                    );
                    error = false;
                } catch (err) {
                    error = true;
                }
            }
        } catch {
            error = true;
        }
    }

    return c.html(
        <Base title="Poemonger | Activate">
            <ActivatePage error={error} />
        </Base>
    );
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
        }>(`user=${body.email}`, { type: "json" });

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

app.post("/login", async (c) => {
    var ct = c.req.header("Content-Type");
    var f = /multipart\/form-data/g.test(ct || "");
    var error = true;
    var messages = {
        success: `Successfully processed your login request.`,
        failure: `Could not process your request. Please send a form.`,
        error: "There was a problem saving your information. Please try again.",
        exists: "There is not an account with this email address or password.",
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

    var u = await c.env.USERS_KV.get<{ created_at: number; hash: string; }>(`user=${email}`, { type: 'json' });
    if (!u) {
        message = messages.exists;
        c.status(409);
    } else {
        try {
            const n = u.created_at;
            const hash = u.hash;
            const H = new Hashes();
            const h = await H.HashPasswordWithSalt(password as string, n);
            if (h === hash) error = false;
        } catch {
            message = messages.exists;
            c.status(409);
        }
    }
    
    return c.json({ error, message });
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
