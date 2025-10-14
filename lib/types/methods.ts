
export interface ItemData {
    id: number;
    highalch: number;
    lowalch: number;
    buylimit: number;
}

export type crafting_methods = {
    id: number
    lvl: number;
    product: string;
    exp: number;
    exp_rate: number;
    ingredients: Record<string, any>;
};
