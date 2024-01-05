import * as bcrypt from "bcryptjs";

// export default class BcryptHelper {
//   static hashPassword(password: string): string {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
//   }

//   static comparePassword(password: string, hash: string): boolean {
//     return bcrypt.compareSync(password, hash)
//   }
// }

export default class BcryptHelper {
  static async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
