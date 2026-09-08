import mongoose from "mongoose";
import "dotenv/config";
import foodModel from "./models/foodModel.js";
import categoryModel from "./models/categoryModel.js";

const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/teyvat_takeout";

const defaultCategories = [
  {
    name: "Salad",
    description: "Crisp, farm-fresh gourmet salads with handcrafted artisanal dressings.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Rolls",
    description: "Flaky wraps and rolls packed with premium proteins and zesty sauces.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Deserts",
    description: "Single-origin chocolates, velvety cheesecakes, and artisanal sweet delights.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Sandwich",
    description: "Artisanal sourdough and focaccia sandwiches loaded with gourmet fillings.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Cake",
    description: "Multi-layered celebration cakes baked to perfection with pure buttercream.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Pure Veg",
    description: "100% vegetarian culinary specialties rich in authentic spice and flavor.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Pasta",
    description: "Hand-rolled Italian pastas tossed in velvety sauces and aged cheeses.",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
  {
    name: "Noodles",
    description: "Wok-tossed ramen, udon, and egg noodles bursting with umami notes.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  },
];

const gourmetFoods = [
  // --- SALADS ---
  {
    name: "Mediterranean Greek Salad",
    description: "Crisp romaine, Kalamata olives, diced cucumbers, heirloom tomatoes, and creamy feta dressed in cold-pressed extra virgin olive oil and oregano.",
    price: 249,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Avocado Quinoa Garden Bowl",
    description: "Nutty organic quinoa topped with hass avocado, roasted chickpeas, charred corn, pomegranate pearls, and lemon-tahini dressing.",
    price: 289,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Burrata Caprese Royale",
    description: "Handcrafted artisanal burrata cheese served over sweet vine-ripened tomatoes, fresh basil leaves, aged Modena balsamic reduction, and toasted pine nuts.",
    price: 349,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Grilled Herb Caesar Salad",
    description: "Charred artisan romaine heart, house garlic croutons, shaved 24-month Parmigiano-Reggiano, and rich garlic-anchovy dressing.",
    price: 269,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- ROLLS & WRAPS ---
  {
    name: "Smoky Peri Peri Chicken Wrap",
    description: "Tender grilled chicken chunks infused with fiery African bird's eye chili, crisp iceberg lettuce, caramelized onions, and garlic aioli in toasted lavash.",
    price: 279,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Paneer Tikka Kathi Roll",
    description: "Char-grilled cottage cheese cubes marinated in Kashmiri chili yogurt, wrapped in flaky paratha with mint-coriander chutney and pickled shallots.",
    price: 239,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Crispy Falafel Hummus Wrap",
    description: "Herb-packed golden chickpea falafels with creamy velvety hummus, pickled gherkins, sumac onions, and tahini drizzle inside a warm pita roll.",
    price: 219,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Truffle Butter Mushroom Roll",
    description: "Pan-seared wild button and shiitake mushrooms tossed in white truffle oil and fresh herbs, tucked into warm gourmet flatbread.",
    price: 259,
    category: "Rolls",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- DESERTS ---
  {
    name: "Belgian Molten Chocolate Lava",
    description: "Warm single-origin Belgian dark chocolate cake with a luscious flowing molten core, dusted with French cocoa powder.",
    price: 229,
    category: "Deserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "New York Berry Cheesecake",
    description: "Velvety smooth cream cheese baked over buttery graham cracker crust, topped with fresh raspberry compote and edible flowers.",
    price: 269,
    category: "Deserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Classic Italian Tiramisu",
    description: "Espresso-soaked Savoiardi ladyfingers layered with whipped mascarpone cream, dark rum essence, and bittersweet Dutch cocoa.",
    price: 259,
    category: "Deserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Parisian Macaron Selection",
    description: "Assortment of six delicate almond meringue macarons with pistachio, salted caramel, Madagascar vanilla, and raspberry ganache fillings.",
    price: 299,
    category: "Deserts",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- SANDWICH ---
  {
    name: "Sourdough Smoked Chicken Club",
    description: "Triple-layered artisan toasted sourdough with sliced smoked chicken breast, aged cheddar, butterhead lettuce, and sun-dried tomato pesto.",
    price: 299,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Pesto Bocconcini Panini",
    description: "Fresh basil walnut pesto, buffalo mozzarella slices, slow-roasted cherry tomatoes, and arugula pressed to crispy golden perfection.",
    price: 269,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Spiced Mushroom Brioche Melt",
    description: "Sautéed wild forest mushrooms with caramelized shallots and melted Emmental cheese on toasted butter brioche.",
    price: 249,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Avocado Green Goddess Toast",
    description: "Chunky smashed Hass avocado on rustic sourdough topped with radishes, microgreens, hemp seeds, and extra virgin chili olive oil.",
    price: 239,
    category: "Sandwich",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- CAKE ---
  {
    name: "Dark Chocolate Truffle Cake",
    description: "Decadent multi-layered moist chocolate sponge coated with glossy Belgian dark chocolate ganache and chocolate curls.",
    price: 389,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Madagascar Vanilla Bean Cake",
    description: "Fluffy vanilla sponge infused with real bourbon vanilla pods, frosted with silken buttercream and seasonal fresh berries.",
    price: 349,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Red Velvet Cream Cheese Gateau",
    description: "Vibrant crimson velvet sponge layers paired with tangy sweet whipped cream cheese frosting and white chocolate pearls.",
    price: 369,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Lotus Biscoff Crunch Cake",
    description: "Caramelized speculoos biscuit sponge layered with crunchy Biscoff spread mousse and toasted caramelized crumbs.",
    price: 399,
    category: "Cake",
    image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- PURE VEG ---
  {
    name: "Royal Paneer Makhani Platter",
    description: "Charcoal-smoked cottage cheese simmering in a rich satin gravy of San Marzano tomatoes, cashew butter, and fenugreek leaves.",
    price: 329,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Slow-Cooked Dal Makhani Luxe",
    description: "Black lentils and kidney beans slow-simmered for 24 hours over charcoal with churned white butter, cream, and aromatic spices.",
    price: 279,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Awadhi Veg Dum Biryani",
    description: "Fragrant aged Basmati rice layered with garden vegetables, saffron milk, caramelized brown onions, and sealed in clay pot dum.",
    price: 319,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Tandoori Stuffed Portobello",
    description: "Plump portobello mushroom caps stuffed with spiced paneer, roasted peppers, and glazed with mint tandoori marinade.",
    price: 289,
    category: "Pure Veg",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- PASTA ---
  {
    name: "Penne Arrabbiata Gourmet",
    description: "Bronze-die penne rigate tossed in fiery garlic, San Marzano plum tomatoes, fresh red chilies, extra virgin olive oil, and sweet basil.",
    price: 289,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Creamy Truffle Fettuccine",
    description: "Handmade ribbons of fettuccine enveloped in velvety Parmigiano-Reggiano cream sauce, black truffle shavings, and cracked black pepper.",
    price: 369,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Four-Cheese Baked Lasagna",
    description: "Layered pasta sheets with slow-cooked herb tomato ragù, mozzarella di bufala, ricotta, fontina, and golden parmesan crust.",
    price: 349,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Basil Pesto Sun-Dried Rigatoni",
    description: "Al dente rigatoni tossed in vibrant Genovese pine-nut basil pesto, sun-dried cherry tomatoes, and toasted walnuts.",
    price: 309,
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },

  // --- NOODLES ---
  {
    name: "Spicy Sichuan Dan Dan Noodles",
    description: "Springy wheat noodles in rich sesame-chili broth, topped with crispy spiced minced protein, scallions, and crushed peanuts.",
    price: 279,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Wok-Tossed Pad Thai Royale",
    description: "Flat rice noodles stir-fried with sweet tamarind glaze, farm bean sprouts, pressed tofu, lime wedge, and crushed roasted peanuts.",
    price: 299,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Chili Garlic Hakka Noodles",
    description: "Wok-charred thin egg noodles tossed with shredded bell peppers, cabbage, burnt garlic crisps, and dark soy drizzle.",
    price: 249,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  },
  {
    name: "Shiitake Mushroom Udon Bowl",
    description: "Thick chewy Japanese udon noodles in aromatic dashi broth with braised shiitake mushrooms, baby bok choy, and sesame oil.",
    price: 319,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    rating: 0,
    reviewsCount: 0
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully!");

    console.log("Clearing and updating category catalog...");
    await categoryModel.deleteMany({});
    const insertedCategories = await categoryModel.insertMany(defaultCategories);
    console.log(`Successfully seeded ${insertedCategories.length} categories!`);

    console.log("Clearing and seeding food catalog...");
    await foodModel.deleteMany({});
    const inserted = await foodModel.insertMany(gourmetFoods);
    console.log(`Successfully seeded ${inserted.length} dishes across all categories!`);

    const categories = Array.from(new Set(inserted.map(item => item.category)));
    console.log("Active dish categories:", categories);

    await mongoose.connection.close();
    console.log("MongoDB connection closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
