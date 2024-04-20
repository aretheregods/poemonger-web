import HTTP from '../utils/http/index.js'

var request = new HTTP();
request.logout({ path: '/admin/logout', redirect: '/admin' });

