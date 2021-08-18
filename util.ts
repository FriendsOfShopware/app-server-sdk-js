export function randomString()
{
    let f = () => Math.random().toString(36).substring(2);

    return f() + f();
}