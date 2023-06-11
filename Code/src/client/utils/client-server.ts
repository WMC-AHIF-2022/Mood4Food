export async function fetchRestEndpoint(route: string, httpMethod: "GET" | "POST" | "DELETE"|"PUT", data?: object): Promise<any>{
    let options: any = { method: httpMethod };

    if (data){
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(data);
    }

    const response = await fetch(route, options);

    if (response.ok){
        return response;
    }
    else {
        const errorMessage = await response.text()
        //throw new Error(errorMessage);
        return response;
    }
}