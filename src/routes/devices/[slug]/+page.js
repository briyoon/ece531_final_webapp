/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    return { deviceId: params.slug }
}