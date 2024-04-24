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
}
