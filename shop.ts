export class Shop {
    constructor(public id : string, public shopUrl: string, public shopSecret: string, public clientId: string|null = null, public clientSecret: string|null = null) {}
}