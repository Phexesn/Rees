/**
 * Five fictional sample listings for demos and the quality walkthrough.
 * Addresses are made up; details are typical of real listings in each market
 * (not copied from any portal).
 */
export const SAMPLE_LISTINGS = [
  {
    address: "1248 Maple Grove Lane", city: "Plano", state: "TX", zip: "75024", price: 489000,
    propertyType: "single_family", beds: 4, baths: 2.5, sqft: 2350, yearBuilt: 2004, stories: 2,
    garage: "2-car attached", facing: "E", lotSize: "0.19 acre",
    features: "Open kitchen with quartz counters and gas range, primary suite on main floor, vaulted living room with gas fireplace, study with French doors",
    upgrades: "New roof 2022, HVAC 2021, LVP flooring downstairs 2023",
    outdoor: "Covered patio, fenced backyard, mature live oak",
    neighborhood: "2 blocks to Lakeside Park, 10 minutes to the Dallas North Tollway, Plano ISD",
  },
  {
    address: "77 Harbor View Drive, Unit 504", city: "San Diego", state: "CA", zip: "92101", price: 925000,
    propertyType: "condo", beds: 2, baths: 2, sqft: 1240, yearBuilt: 2008, stories: 1,
    garage: "2 deeded parking spaces", facing: "W", hoaFee: 690,
    features: "Floor-to-ceiling windows, west-facing balcony with bay views, split-bedroom layout, in-unit laundry, wood floors",
    upgrades: "Kitchen remodel 2021 with quartz and Bosch appliances",
    outdoor: "Private balcony; building has pool, gym and rooftop deck",
    neighborhood: "Walk to Little Italy restaurants and the waterfront; 5 minutes to the airport",
  },
  {
    address: "3910 Sycamore Court", city: "Garden Grove", state: "CA", zip: "92844", price: 1049000,
    propertyType: "single_family", beds: 4, baths: 3, sqft: 1980, yearBuilt: 1962, stories: 1,
    garage: "2-car detached", facing: "N", lotSize: "6,500 sq ft",
    features: "Single-story, remodeled kitchen with island, separate family room, bedroom and full bath that work well as a guest suite",
    upgrades: "Copper repipe 2019, solar panels (owned) 2020, dual-pane windows",
    outdoor: "Large backyard with fruit trees and covered patio",
    neighborhood: "Near shopping centers on Brookhurst St, 5 minutes to the 22 freeway, Garden Grove Unified",
  },
  {
    address: "512 Peachtree Hollow", city: "Duluth", state: "GA", zip: "30096", price: 565000,
    propertyType: "townhouse", beds: 3, baths: 3.5, sqft: 2210, yearBuilt: 2017, stories: 3,
    garage: "2-car rear-entry", facing: "S", hoaFee: 210,
    features: "End unit, 10-ft ceilings on main, chef's kitchen with gas cooktop, finished terrace level with full bath",
    upgrades: "Custom closet systems 2022, smart thermostat",
    outdoor: "Deck off the kitchen, community pool and playground",
    neighborhood: "5 minutes to Pleasant Hill Road shops and restaurants, Gwinnett County Schools",
  },
  {
    address: "88 Bayou Bend Drive", city: "Houston", state: "TX", zip: "77036", price: 349000,
    propertyType: "single_family", beds: 3, baths: 2, sqft: 1650, yearBuilt: 1978, stories: 1,
    garage: "2-car attached", facing: "W", lotSize: "0.15 acre",
    features: "Open living and dining, updated kitchen with granite, wood-burning fireplace, large primary bedroom",
    upgrades: "Foundation repair with transferable warranty 2020, water heater 2023",
    outdoor: "Fenced backyard with shade trees",
    neighborhood: "Close to Bellaire Blvd restaurants and markets, 15 minutes to the Galleria",
  },
] as const;
