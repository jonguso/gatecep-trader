export const nseSecurityMaster = {
  EQT: {
    symbol: "EQT",
    name: "Equity Group Holdings PLC",
    sector: "Banking",
    price: 75.25
  },

  IMH:{
 symbol:"IMH",
 aliases:[
   "I&M",
   "I & M",
   "I AND M",
   "IMH"
 ],
 name:"I&M Group PLC",
 sector:"Banking",
 price:50.50
},

  DTK: {
    symbol: "DTK",
    aliases: ["DTB"],
    name: "Diamond Trust Bank Kenya Ltd",
    sector: "Banking",
    price: 149.00
  },

  KCB: {
    symbol: "KCB",
    name: "KCB Group PLC",
    sector: "Banking",
    price: 67.75
  },

  ABSA: {
    symbol: "ABSA",
    name: "Absa Bank Kenya PLC",
    sector: "Banking",
    price: 29.00
  },

  COOP: {
    symbol: "COOP",
    name: "Co-operative Bank of Kenya Ltd",
    sector: "Banking",
    price: 31.60
  },

  NCBA: {
    symbol: "NCBA",
    name: "NCBA Group PLC",
    sector: "Banking",
    price: 88.00
  },

KQ: {
    symbol: "KQ",
    name: "Kenya Airways",
    sector: "Commercial and Services",
    price: 5.88
  },


  SCOM: {
    symbol: "SCOM",
    name: "Safaricom PLC",
    sector: "Telecommunication",
    price: 30.60
  },

  BAT: {
    symbol: "BAT",
    name: "British American Tobacco Kenya PLC",
    sector: "Manufacturing and Allied",
    price: 520.00
  },

  EABL: {
    symbol: "EABL",
    name: "East African Breweries PLC",
    sector: "Manufacturing and Allied",
    price: 248.00
  },

GLD:{
 symbol:"GLD",
 aliases:["NEWGOLD"],
 name:"ABSA NewGold ETF",
 sector:"ETF",
 price:5650.00
},

KEGN:{
 symbol:"KEGN",
 aliases:["KENGEN"],
 name:"KenGen PLC",
 sector:"Energy and Petroleum",
 price:9.12
},

KNRE:{
 symbol:"KNRE",
 aliases:["KENYA RE"],
 name:"Kenya Re",
 sector:"Insurance",
 price:3.34
},

KPC: {
  symbol: "KPC",
  name: "Kenya Pipeline Company PLC",
  sector: "Energy and Petroleum",
  price: 9.20
},

KPLC:{
 symbol:"KPLC",
 name:"Kenya Power",
 sector:"Energy and Petroleum",
 price:16.10
},


SBIC:{
 symbol:"SBIC",
 aliases:["STANBIC"],
 name:"Stanbic Holdings PLC",
 sector:"Banking",
 price:270
},

SMWF:{
 symbol:"SMWF",
 aliases:["SANLAM WORLD ETF"],
 name:"Sanlam MSCI World ETF",
 sector:"ETF",
 price:940.00
},
  SCBK:{
    symbol:"SCBK",
    name:"Standard Chartered Bank Kenya Ltd",
    sector:"Banking",
    price:336.00
  }

};

export function normalizeNseSymbol(symbol = "") {

 const raw =
  String(symbol || "")
   .trim()
   .toUpperCase()

   // remove spaces

   .replace(/\s+/g,"")

   // remove &, -, /, commas etc

   .replace(/[^A-Z0-9]/g,"");

 for(
   const [master,row]
   of Object.entries(
      nseSecurityMaster
   )
 ){

   const normalizedMaster =
    master
    .replace(/\s+/g,"")
    .replace(/[^A-Z0-9]/g,"");

   if(
      normalizedMaster===raw
   ){

      return master;

   }

   const aliases =
    (row.aliases||[])
    .map(
      x=>
       String(x)
       .toUpperCase()
       .replace(/\s+/g,"")
       .replace(/[^A-Z0-9]/g,"")
    );

   if(
      aliases.includes(raw)
   ){

      return master;

   }

 }

 return raw;

}
export function applySecurityMaster(row = {}) {
  const normalizedSymbol = normalizeNseSymbol(row.symbol);

  const master = nseSecurityMaster[normalizedSymbol];

  if (!master) {
    return {
      ...row,
      symbol: normalizedSymbol
    };
  }

  return {
    ...row,
    symbol: master.symbol,
    name: master.name || row.name,
    sector: master.sector || row.sector,
    price: Number(master.price || row.price || row.lastPrice || 0),
    lastPrice: Number(master.price || row.lastPrice || row.price || 0)
  };
}
 

