let baseUrl = ``;

if (process.env.NODE_ENV === "dev") {
  baseUrl = "https://judge-staging.refactor.academy";
} else if (process.env.NODE_ENV === "prod") {
  baseUrl = "https://judge-staging.refactor.academy";
} else if (process.env.NODE_ENV === "staging") {
  baseUrl = "https://judge-staging.refactor.academy";
}

export const judge0Endpoints={
    NORMAL:`${baseUrl}/submissions/`,
    BATCH:`${baseUrl}/submissions/batch`,
    GET_LANGUAGE:`${baseUrl}/languages`    
}