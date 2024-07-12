import { IUser } from "../../@types";
export class UserHelper {
  static capitalizeFirstLetter(str: string): string {
    return str
      .trim()
      .split(" ")
      .map((element: string) => {
        return element.charAt(0).toUpperCase() + element.substring(1);
      })
      .join(" ");
  }

  static removeItemsFromUserObject(user: IUser) {
    if (user) {
      return {
        id: user._id as string,
        avatar: user.avatar,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        last_login: user.last_login,
        createdAt: user["createdAt"],
        updatedAt: user["updatedAt"],
        token: user["token"],
      };
    }
    return null;
  }
}

export class ListingHelper {
  static descriptionNotMoreThan160Characters(description: string): number {
    description = description.split(" ").join("");

    return description.length;
  }

  static calculateDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount) / 100;
  }

  static async getCoordinatesFromAddress(address: string): Promise<string> {
    const encodedAddress = encodeURI(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env["GOOGLE_MAP_API_KEY"]}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch coordinates from address");
    }

    const data = (await response.json()) as {
      results: { geometry: { location: { lat: number; lng: number } } }[];
    };

    if (data.results.length === 0) {
      throw new Error("No coordinates found for the address");
    }

    const coordinates = `${data?.results[0]?.geometry?.location?.lat}, ${data?.results[0]?.geometry?.location?.lng}`;

    return coordinates;
  }
}
