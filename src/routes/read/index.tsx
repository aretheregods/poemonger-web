import { Hono } from 'hono'

type Bindings = { POEMONGER_READER_SESSIONS: DurableObjectNamespace }

const read = new Hono<{ Bindings: Bindings }>()
