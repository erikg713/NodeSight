// services/piAuthService.js

import axios from "axios";

export async function verifyPiToken(accessToken) {

  try {

    const response = await axios.get(
      "https://api.minepi.com/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("Pi token verification failed");
    return null;

  }

}
