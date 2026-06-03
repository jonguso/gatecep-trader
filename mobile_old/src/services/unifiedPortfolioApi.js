import API from "../api";

export async function getUnifiedPortfolio(userId = "u1") {
  const res = await API.get(`/unified-portfolio/${userId}`);
  return res.data;
}
