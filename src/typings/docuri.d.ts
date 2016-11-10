
declare module "docuri" {
    interface Route<T> {
        // parse DocURI string to object
        (str: string): T | false;

        // generate DocURI string from object
        (obj: T): string;

        // change DocURI string parts with values provided by object returning a string
        (str: string, obj: T): string;
    }

    export function route<T>(route: string): Route<T>;
}
