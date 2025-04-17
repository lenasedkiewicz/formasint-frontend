const BASE_URL = "https://brandstestowy.smallhost.pl/api";

fetch(`${BASE_URL}/random`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Dane:", data);
  })
  .catch((error) => {
    console.error("Error while fetching data", error);
  });

// https://brandstestowy.smallhost.pl/api/random?pageNumber=2&pageSize=2
