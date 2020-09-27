export type TypeMetadata = {
    scope?: string, 
    isSingleton: boolean, 
    target: Function, 
    dependencies: Function[]
}

export const defaultTypeMetadatas: TypeMetadata[] = [];