export class MarketDataProvider {
  async getQuotes() {
    throw new Error("getQuotes() not implemented");
  }

  async getDepth(symbol) {
    throw new Error("getDepth(symbol) not implemented");
  }

  async getSecurity(symbol) {
    const quotes = await this.getQuotes();
    return quotes.find(x => String(x.symbol).toUpperCase() === String(symbol).toUpperCase());
  }
}
