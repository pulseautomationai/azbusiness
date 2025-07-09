import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function CityDebugComponent() {
  const cities = useQuery(api.cities.getCities);
  const seedCities = useMutation(api.seed.seedCities);

  const handleSeedCities = async () => {
    try {
      const result = await seedCities();
      console.log("Seed result:", result);
      alert(`Success: ${result.message}`);
    } catch (error) {
      console.error("Seed error:", error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>City Debug Panel</CardTitle>
        <CardDescription>Debug cities data loading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Cities Query Status:</strong>{" "}
          {cities === undefined ? "Loading..." : cities === null ? "Error" : `${cities.length} cities loaded`}
        </div>
        
        {cities && cities.length > 0 && (
          <div>
            <strong>Sample Cities:</strong>
            <ul className="list-disc ml-4 mt-2">
              {cities.slice(0, 5).map((city) => (
                <li key={city._id}>
                  {city.name} ({city.region}) - {city.slug}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={handleSeedCities} variant="outline">
          Seed Cities Data
        </Button>
      </CardContent>
    </Card>
  );
}