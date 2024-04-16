import { deleteCookie } from '../utils/cookies/index.js';

deleteCookie('poemonger_session')
setTimeout(() => location.href = "/", 100)
