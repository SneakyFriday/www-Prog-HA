/**
 * TODO: Script noch im Controller implementieren
 * Das hier ist/war nur zum Testen der API
 */

const searchButton = document.querySelector("#search")

searchButton.addEventListener("click", () => {
    console.log("Button pressed")
    fetchAPI()
})

async function fetchAPI(){
    const API_KEY = "nVLMTnjDZivQDwoYW8P4RAM21hvLigt42HilbzLj";
    const fetchedData = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    const data = await fetchedData.json();
    usefetchedAPI(data);
}

function usefetchedAPI(data){
    document.querySelector("#content").innerHTML = `<p>${data.explanation}</p>`;
    document.querySelector("#content").innerHTML = `<img src=${data.url}>`;
}