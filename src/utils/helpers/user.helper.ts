export class CapitalizeFirstLetter {
  static capitalizeFirstLetter(str: string): string {
    return str
      .trim()
      .split(" ")
      .map((element: string) => {
        return element.charAt(0).toUpperCase() + element.substring(1);
      })
      .join(" ");
  }
}

export class ListingHelper {
  static descriptionNotMoreThan160Characters(description: string): number {
    description = description.split(" ").join("");

    return description.length;
  }
}
