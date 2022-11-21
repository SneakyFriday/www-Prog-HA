let searchButton = document.querySelector("#search")

searchButton.addEventListener("click", () => {
    console.log("Button pressed")
    fetchAPI()
})

async function fetchAPI(){
    let API_KEY = "nVLMTnjDZivQDwoYW8P4RAM21hvLigt42HilbzLj";
    let fetchedData = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    let data = await fetchedData.json();
    usefetchedAPI(data);
}

function usefetchedAPI(data){
    document.querySelector("#content").innerHTML = `<p>${data.explanation}</p>`;
    document.querySelector("#content").innerHTML = `<img src=${data.url}>`;
}