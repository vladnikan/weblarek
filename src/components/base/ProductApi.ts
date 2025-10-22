import { Api, ApiListResponse } from "./api";
import { Product } from "../../types";

export class ProductApi extends Api {

    async getProducts(): Promise<Product[]> {
        const data = await this.get('/product/');
        console.log('данные получены')
        const response = data as ApiListResponse<Product>;
        return response.items;
    }
}