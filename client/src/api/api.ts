import axios from "axios";

const api = axios.create({
    baseURL: `${process.env['REACT_APP_API_URL']}api/`,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDates(object: any) {
    if (object === null || object === undefined || typeof object != 'object')
        return object;
    // 2019-02-22T20:18:00.000Z
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    for (const k of Object.keys(object)) {
        const val = object[k];
        if (val && typeof val == 'string' && dateRegex.test(val)) {
            object[k] = new Date(val);
        } else {
            parseDates(val);
        }
    }
}

api.interceptors.response.use(response => {
    parseDates(response.data);
    return response;
});

export default api;