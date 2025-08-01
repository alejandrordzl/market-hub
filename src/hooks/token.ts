
export const useUserToken = ()=> {
    return process.env.NEXT_PUBLIC_CUSTOM_API_KEY;
    // TODO: Add logic to get the token from local storage or cookies
}