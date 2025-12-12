const properties = [
    {
        id: 1,
        title: "Modern Downtown Apartment",
        price: "$450,000",
        location: "123 Main St, Downtown",
        shortDescription: "Stylish 2-bedroom apartment in the heart of downtown with city views.",
        fullDescription: "This stunning modern apartment features an open-concept living area, floor-to-ceiling windows with panoramic city views, high-end finishes, and a spacious balcony. The gourmet kitchen includes quartz countertops, stainless steel appliances, and custom cabinetry. Master suite has a walk-in closet and en-suite bathroom with heated floors. Building amenities include 24/7 concierge, fitness center, and rooftop terrace.",
        image: "property1.jpg",
        gallery: ["property1.jpg", "property1-gallery1.jpg", "property1-gallery2.jpg", "property1-gallery3.jpg", "property1-gallery4.jpg"],
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        yearBuilt: 2019,
        propertyType: "Apartment",
        features: ["City View", "Balcony", "Concierge", "Gym", "Underground Parking"],
        agent: {
            name: "Sarah Johnson",
            phone: "(555) 123-4567",
            email: "sarah@realestate.com"
        }
    },
    {
        id: 2,
        title: "Suburban Family Home",
        price: "$750,000",
        location: "456 Oak Ave, Suburbia",
        shortDescription: "Beautiful 4-bedroom family home in a quiet suburban neighborhood.",
        fullDescription: "This charming family home sits on a spacious lot with mature trees and beautifully landscaped gardens. The recently renovated interior features a gourmet kitchen with granite countertops, a formal dining room, and a cozy family room with a fireplace. Upstairs you'll find four generous bedrooms, including a master suite with a walk-in closet and luxurious en-suite bathroom. The finished basement offers additional living space perfect for a home theater or playroom.",
        image: "property2.jpg",
        gallery: ["property2.jpg", "property2-gallery1.jpg", "property2-gallery2.jpg", "property2-gallery3.jpg", "property2-gallery4.jpg"],
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        yearBuilt: 2005,
        propertyType: "House",
        features: ["Large Yard", "Finished Basement", "Fireplace", "Garage", "Renovated Kitchen"],
        agent: {
            name: "Michael Chen",
            phone: "(555) 234-5678",
            email: "michael@realestate.com"
        }
    },
    {
        id: 3,
        title: "Luxury Penthouse",
        price: "$2,500,000",
        location: "789 Skyline Blvd, Uptown",
        shortDescription: "Exclusive penthouse with panoramic city views and luxury finishes.",
        fullDescription: "This extraordinary penthouse occupies the entire top floor of the prestigious Skyline Tower, offering unparalleled 360-degree city views. The expansive open-concept living space features 12-foot ceilings, floor-to-ceiling windows, and a gourmet chef's kitchen with top-of-the-line appliances. The master suite is a true retreat with a private terrace, spa-like bathroom, and custom-built walk-in closet. Additional features include a private elevator entrance, smart home automation, and access to building amenities including a spa, pool, and private dining room.",
        image: "property3.jpg",
        gallery: ["property3.jpg", "property3-gallery1.jpg", "property3-gallery2.jpg", "property3-gallery3.jpg", "property3-gallery4.jpg"],
        bedrooms: 3,
        bathrooms: 3.5,
        sqft: 3200,
        yearBuilt: 2021,
        propertyType: "Penthouse",
        features: ["Panoramic Views", "Private Terrace", "Smart Home", "Pool", "Concierge"],
        agent: {
            name: "Robert Williams",
            phone: "(555) 345-6789",
            email: "robert@realestate.com"
        }
    },
    {
        id: 4,
        title: "Riverside Condo",
        price: "$380,000",
        location: "101 River Rd, Riverside",
        shortDescription: "Cozy 1-bedroom condo with beautiful river views.",
        fullDescription: "Enjoy serene river views from this well-maintained condo in the desirable Riverside community. The open floor plan creates a bright and airy living space that opens to a private balcony overlooking the river. Updated kitchen features stainless steel appliances and granite countertops. Building offers excellent amenities including a fitness center, community lounge, and direct access to the riverside walking trail. Perfect for professionals or as an investment property.",
        image: "property4.jpg",
        gallery: ["property4.jpg", "property4-gallery1.jpg", "property4-gallery2.jpg", "property4-gallery3.jpg", "property4-gallery4.jpg"],
        bedrooms: 1,
        bathrooms: 1,
        sqft: 850,
        yearBuilt: 2010,
        propertyType: "Condo",
        features: ["River View", "Balcony", "Fitness Center", "Updated Kitchen", "Walkable Location"],
        agent: {
            name: "Jennifer Lee",
            phone: "(555) 456-7890",
            email: "jennifer@realestate.com"
        }
    },
    {
        id: 5,
        title: "Modern Townhouse",
        price: "$625,000",
        location: "202 Elm St, Midtown",
        shortDescription: "Contemporary 3-bedroom townhouse with rooftop terrace.",
        fullDescription: "This modern townhouse offers three levels of sophisticated living space in the heart of Midtown. The main floor features an open-concept living and dining area that flows into a chef's kitchen with premium appliances. Upper level includes three bedrooms and two bathrooms, with the master suite featuring a walk-in closet and luxurious en-suite. The rooftop terrace is perfect for entertaining with stunning city views. Private garage parking and low maintenance make this an ideal urban residence.",
        image: "images/property5.jpg",
        gallery: ["images/property5.jpg", "images/property5-gallery1.jpg", "images/property5-gallery2.jpg", "images/property5-gallery3.jpg", "images/property5-gallery4.jpg"],
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1800,
        yearBuilt: 2018,
        propertyType: "Townhouse",
        features: ["Rooftop Terrace", "Garage", "Modern Finishes", "Walkable", "Low Maintenance"],
        agent: {
            name: "David Wilson",
            phone: "(555) 567-8901",
            email: "david@realestate.com"
        }
    },
    {
        id: 6,
        title: "Country Estate",
        price: "$1,200,000",
        location: "303 Country Lane, Rural",
        shortDescription: "Spacious country estate on 5 acres with pool and guest house.",
        fullDescription: "Escape to this magnificent country estate set on 5 acres of beautifully landscaped grounds. The main residence features a grand foyer, formal living and dining rooms, a gourmet kitchen with commercial-grade appliances, and a sunroom overlooking the pool. The property includes a separate guest house, perfect for visitors or as a rental opportunity. Outdoor amenities include a heated pool, tennis court, and extensive gardens. Just 30 minutes from downtown, this property offers the perfect balance of country living with city convenience.",
        image: "property6.jpg",
        gallery: ["property6.jpg", "property6-gallery1.jpg", "property6-gallery2.jpg", "property6-gallery3.jpg", "property6-gallery4.jpg"],
        bedrooms: 5,
        bathrooms: 4.5,
        sqft: 4500,
        yearBuilt: 2000,
        propertyType: "Estate",
        features: ["5 Acres", "Pool", "Guest House", "Tennis Court", "Updated Kitchen"],
        agent: {
            name: "Amanda Rodriguez",
            phone: "(555) 678-9012",
            email: "amanda@realestate.com"
        }
    },
    {
        id: 7,
        title: "Urban Loft",
        price: "$550,000",
        location: "404 Warehouse District, Downtown",
        shortDescription: "Converted warehouse loft with industrial charm and modern amenities.",
        fullDescription: "Live in a piece of history with this beautifully converted warehouse loft. Original features include exposed brick walls, timber beams, and polished concrete floors, combined with modern updates and high-end finishes. The open-concept living space is flooded with natural light from oversized factory windows. The gourmet kitchen features custom cabinetry and professional-grade appliances. Building amenities include secured entry, freight elevator, and common rooftop deck with city views.",
        image: "property7.jpg",
        gallery: ["property7.jpg", "property7-gallery1.jpg", "property7-gallery2.jpg", "property7-gallery3.jpg", "property7-gallery4.jpg"],
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1600,
        yearBuilt: 1920,
        propertyType: "Loft",
        features: ["Exposed Brick", "High Ceilings", "Rooftop Deck", "Industrial Style", "Historic Building"],
        agent: {
            name: "Thomas Brown",
            phone: "(555) 789-0123",
            email: "thomas@realestate.com"
        }
    },
    {
        id: 8,
        title: "Waterfront Villa",
        price: "$3,500,000",
        location: "505 Beach Blvd, Waterfront",
        shortDescription: "Luxury waterfront villa with private dock and beach access.",
        fullDescription: "Experience unparalleled luxury in this exquisite waterfront villa. Every detail has been carefully considered, from the imported marble floors to the custom millwork throughout. The main level features walls of glass that open to the expansive terrace and infinity pool overlooking the water. The gourmet kitchen is equipped with top-of-the-line appliances and a butler's pantry. The lower level includes a wine cellar, home theater, and gym. The property includes a private dock and direct beach access.",
        image: "property8.jpg",
        gallery: ["property8.jpg", "property8-gallery1.jpg", "property8-gallery2.jpg", "property8-gallery3.jpg", "property8-gallery4.jpg"],
        bedrooms: 6,
        bathrooms: 7,
        sqft: 6800,
        yearBuilt: 2015,
        propertyType: "Villa",
        features: ["Waterfront", "Private Dock", "Infinity Pool", "Home Theater", "Wine Cellar"],
        agent: {
            name: "Elizabeth Taylor",
            phone: "(555) 890-1234",
            email: "elizabeth@realestate.com"
        }
    },
    {
        id: 9,
        title: "Garden Suite",
        price: "$320,000",
        location: "606 Garden Way, Suburbia",
        shortDescription: "Charming garden suite with private entrance and outdoor space.",
        fullDescription: "This charming garden suite offers the perfect blend of privacy and convenience. The self-contained unit features a bright living area, updated kitchen with stainless steel appliances, a spacious bedroom, and a private patio overlooking the beautifully landscaped garden. Located in a quiet neighborhood with excellent schools and convenient access to shopping and transit. Ideal for first-time buyers, downsizers, or as an investment property.",
        image: "property9.jpg",
        gallery: ["property9.jpg", "property9-gallery1.jpg", "property9-gallery2.jpg", "property9-gallery3.jpg", "property9-gallery4.jpg"],
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        yearBuilt: 1985,
        propertyType: "Suite",
        features: ["Private Entrance", "Garden", "Updated Kitchen", "Quiet Neighborhood", "Pet Friendly"],
        agent: {
            name: "Christopher Moore",
            phone: "(555) 901-2345",
            email: "chris@realestate.com"
        }
    },
    {
        id: 10,
        title: "Mountain Retreat",
        price: "$890,000",
        location: "707 Mountain Rd, Highlands",
        shortDescription: "Secluded mountain retreat with stunning views and modern amenities.",
        fullDescription: "Escape to this stunning mountain retreat nestled among tall pines with panoramic mountain views. The home features a great room with floor-to-ceiling windows and a stone fireplace, perfect for cozy evenings. The chef's kitchen opens to a spacious deck ideal for outdoor dining. The property includes a separate studio space that could be used as an office, gym, or artist's studio. Located just minutes from hiking trails and ski resorts, this is the perfect year-round getaway.",
        image: "property10.jpg",
        gallery: ["property10.jpg", "property10-gallery1.jpg", "property10-gallery2.jpg", "property10-gallery3.jpg", "property10-gallery4.jpg"],
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2200,
        yearBuilt: 2012,
        propertyType: "Retreat",
        features: ["Mountain View", "Fireplace", "Deck", "Secluded", "Near Ski Resort"],
        agent: {
            name: "Patricia Lewis",
            phone: "(555) 012-3456",
            email: "patricia@realestate.com"
        }
    },
    {
        id: 11,
        title: "Investment Duplex",
        price: "$680,000",
        location: "808 Investment Ave, University District",
        shortDescription: "Income-generating duplex near university, ideal for investors.",
        fullDescription: "This well-maintained duplex presents an excellent investment opportunity in the desirable University District. Each unit features two bedrooms, one bathroom, a living room, and an updated kitchen. Both units are currently occupied with reliable, long-term tenants. The property includes a shared yard and separate laundry facilities for each unit. With its proximity to the university and strong rental demand, this property offers solid cash flow and appreciation potential.",
        image: "property11.jpg",
        gallery: ["property11.jpg", "property11-gallery1.jpg", "property11-gallery2.jpg", "property11-gallery3.jpg", "property11-gallery4.jpg"],
        bedrooms: 4,
        bathrooms: 2,
        sqft: 1800,
        yearBuilt: 1990,
        propertyType: "Duplex",
        features: ["Income Property", "Two Units", "Updated", "Near University", "Tenant Occupied"],
        agent: {
            name: "James Anderson",
            phone: "(555) 123-4567",
            email: "james@realestate.com"
        }
    },
    {
        id: 12,
        title: "Mid-Century Modern",
        price: "$720,000",
        location: "909 Retro Way, Historic District",
        shortDescription: "Carefully restored mid-century modern home with period details.",
        fullDescription: "This architectural gem has been meticulously restored to preserve its mid-century modern character while incorporating contemporary comforts. Features include original terrazzo floors, floor-to-ceiling windows, and an iconic floating staircase. The open floor plan seamlessly connects the living, dining, and kitchen areas, which open to a private courtyard. The property includes a separate studio/office space and a carport. Located in the sought-after Historic District, this home is a true showcase of timeless design.",
        image: "property12.jpg",
        gallery: ["property12.jpg", "property12-gallery1.jpg", "property12-gallery2.jpg", "property12-gallery3.jpg", "property12-gallery4.jpg"],
        bedrooms: 3,
        bathrooms: 2,
        sqft: 2100,
        yearBuilt: 1962,
        propertyType: "House",
        features: ["Mid-Century Design", "Terrazzo Floors", "Courtyard", "Historic District", "Restored"],
        agent: {
            name: "Victoria Clark",
            phone: "(555) 234-5678",
            email: "victoria@realestate.com"
        }
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { properties };
}