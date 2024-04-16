import HTTP from '../utils/http/index.js';

const request = new HTTP();
request.post({ path: '/logout' }).then(res => {
    if(res.success) location.href = '/'
}).catch(e => console.error('Something went wrong', { e }))
