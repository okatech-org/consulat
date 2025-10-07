import { countries } from "./countries";

export const countryCodeFromPhoneNumber = (phoneNumber: string) => {
  const country = countries.find((country) =>
    phoneNumber.startsWith(country.dial_code)
  );
  return country;
};
