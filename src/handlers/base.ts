import { Request, Response } from "express";

interface IBaseHandler<TRequest extends Request, TResponse extends Response> {
    handle(request: TRequest, response: TResponse): Promise<void>
    isValidRequest(request: TRequest): boolean
}


export abstract class BaseHandler<TRequest extends Request, TResponse extends Response> implements IBaseHandler<TRequest, TResponse> {

    /**
     * Entrypoint for handling the incoming request and outgoing response.
     * @param   {Request} request
     * @param   {Response} response 
     * @returns {Promise<void>}
     */
    async handle(request: TRequest, response: TResponse): Promise<void> {
        console.log('Processing request: ', stringifyRequest(request));

        if (!this.isValidRequest(request)) {
            console.log('Request is invalid. Returning 400 to client.');
            response.status(400).json({
                message: "Bad request."
            });
            return;
        }

        return this.process(request, response);
    }

    /**
     * Abstract method for subclasses to implement the business logic for handling the request.
     * @param request 
     * @param response 
     */
    abstract process(request: TRequest, response: TResponse): Promise<void>;

    /**
     * Abstract method for subclasses to implement request validation.
     * @param request 
     */
    abstract isValidRequest(request: TRequest): boolean;

} 

function stringifyRequest(request: Request) {
    return JSON.stringify({
        headers: request.headers,
        method: request.method,
        url: request.url,
        httpVersion: request.httpVersion,
        body: request.body,
        cookies: request.cookies,
        path: request.path,
        protocol: request.protocol,
        query: request.query,
        hostname: request.hostname,
        ip: request.ip,
        originalUrl: request.originalUrl,
        params: request.params,        
    });
}