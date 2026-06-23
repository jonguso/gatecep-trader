import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  loadCloudPortfolio
} from "./api/portfolioSyncApi";

export async function restorePortfolioFromCloud() {
  try {
    const result = await loadCloudPortfolio();

    const holdings = result?.holdings || [];

    await AsyncStorage.setItem(
      "gatecepPortfolio",
      JSON.stringify(holdings)
    );

    return holdings;
  } catch (error) {
    console.log(
      "Portfolio restore skipped:",
      error.message
    );

    return [];
  }
}