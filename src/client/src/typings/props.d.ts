interface ITransactionProviderProps {
    render(isLoading: boolean, response: any ): void;
}

interface ITransactionProps {
    transaction: any;
}