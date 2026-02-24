// Image mapping for menu items - Add new mappings here when adding new menu images
export const imageMap = {
  "3 WAY COOKED FISH": "3waycookedfish.png",
  "BEEF STEAK": "beefsteak.png",
  "CHICKEN ADOBO": "chickenadobo.png",
  "FRIED RICE": "friedrice.png",
  "GRILLED SQUID": "grilledsquid.png",
  "PORK SINIGANG": "porksinigang.png",
  "5 KINDS": "5kind.png",
  "5 MEAL COURSE FISH": "5mealcoursefish.png",
  "5 MEAL COURSE LAMB SHANK": "5mealcourselambshank.png",
  "5 MEAL COURSE SEABASS": "5mealcourseseabass.png",
  "5 MEAL COURSE STEAK": "5mealcoursesteak.png",
  "5MC ADOBAR": "5mcadobar.png",
  "5MC PATOTILLO": "5mcpatotillo.png",
  "7 MEAL COURSE": "7mealcourse.png",
  "8 COURSE MEAL": "8coursemeal.png",
  "ADD DESSERT": "adddessert.png",
  "ADOBONG PATO NI PAPA": "adobongpato.png",
  "ACQUA PANNA (750ML)": "acquapanna.png",
  "AGUA KIWI": "aguakiwi.png",
  "ALFREDO MUSHROOM PASTA WITH SEARED CHICKEN":
    "alfredomushroompastawithsearedchicken.png",
  "AMERICAN GIANT SCALLOP": "americangiantscallop.png",
  "AMERICAN PANCAKE BREAKFAST": "americanpancakebreakfast.png",
  "AMERICANO (COLD)": "americanocold.png",
  "AMERICANO (HOT)": "americanohot.png",
  "ANGUS PORTERHOUSE": "angusporterhouse.png",
  "ANGUS RIBEYE": "angusribeye.png",
  "ANGUS TOMAHAWK STEAK": "angustomahawk.png",
  "ANGUS TRUFFLE ARANCINI": "angustrufflearancini.png",
  APPETIZERS: "appetizers.png",
  "APRICOT DIJON GLAZED": "apricotdijonglazed.png",
};

// Filter constraints for menu items
export const KITCHEN_CATEGORY = "Kitchen";
export const MIN_PRICE = 0;

// Get image URL from map
export const getImageUrl = (dishName) => {
  const filename = imageMap[dishName];
  return filename ? `${process.env.PUBLIC_URL}/MenuImages/${filename}` : null;
};
