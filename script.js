// https://api.spoonacular.com/recipes/findByIngredients
// api keys: bb5452cb4b074d1a899410830c863f29
//           d0aef524cfc14d6ba3f35bc68ab620b9
//           06238180649d43e0bffc9f3ac6536dc3

var state = {
    numOfRequest: 10, // how many recipe will you get from server? 1-100
    numOfRender: 3,
    rawData: [],
    recipes: [],
}


$('document').ready(function(){

var apiKey = "bb5452cb4b074d1a899410830c863f29"

/**********************************/
/*           EVENT HANDLER        */
/**********************************/

    async function searchBtnHandler(e){
        
        e.preventDefault();
        
        clearSearchList();

        var inputIngredients = $('#inputIng').val().trim(); console.log(inputIngredients);
        
        if(inputIngredients){

            await getRecipesFromAPI(inputIngredients); console.log('raw data: ', state.rawData);
            
            // Take only necessary info from raw data and create each recipe {}. Then add all recipes {}s to one [].
            createRecipesArr(); 
            
            // Lender search list
            renderSearchList(inputIngredients);

        }else{

            // ** Need to change this alert to modal later
            alert('Please enter at least one valid ingredient.');
            
        }

        // PASS2: validate/populate preparation steps into object
        for(var i = 0; i<state.recipes.length;++i)
        await getInstructionsByRecipeId(state.recipes[i].id,i);


        // PASS3: Render recipes to DOM
        renderRecipesList();

    }

/**********************************/
/*              API               */
/**********************************/

    async function getRecipesFromAPI(ingredients) {

        await $.ajax({
            url: `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&number=${state.numOfRequest}&ranking=1&ignorePantry=true&ingredients=${ingredients}`,
            method: 'GET'
        })
            .then(function (response) { state.rawData = response })
            .catch(function (err) {

                // ** Need to change this alert to modal later
                alert('An error occured. Please try again later.');
                throw new Error("Unkown server error occured while getting recipes.");

            })

        if (state.rawData.length === 0) {
            // ** Need to change this alert to modal later
            alert('Please enter at least one valid ingredient.');
        }

    }

/**********************************/
/*              FUNCTION          */
/**********************************/

    function createRecipesArr() {

        var recipesArr = [];

        var l = state.rawData.length;
        for (var i = 0; i < l; i++) {

            var rawRecipe = state.rawData[i];
            var recipeObj = {}; // format: { id: , title: , usedIng: , missedIng: , imgSmall: ,imgLarge: }

            // 1. add id, title, img to RecipeObj
            recipeObj.id = rawRecipe.id;
            recipeObj.title = rawRecipe.title;
            recipeObj.imgSmall = rawRecipe.image;
            recipeObj.imgLarge = resizeImg(rawRecipe.image);

            // 2. add used ingredients arr to RecipeObj
            recipeObj.usedIngredients = createIngArr(rawRecipe.usedIngredients);

            // 3. add missed ingredients arr to RecipeObj
            recipeObj.missedIngredients = createIngArr(rawRecipe.missedIngredients);

            recipesArr.push(recipeObj);
        }

        // Save the created array to state database
        state.recipes = recipesArr;
    }
    function renderRecipesList() {

        $('#recipes').empty();

        for (var i = 0; i < state.numOfRender; i++) {

            var recipeObj = state.recipes[i];

            var recipe = `<div class="recipe">
                        <h2>${recipeObj.title}</h2>
                        <img class="recipe__image" src="${recipeObj.imgSmall}"></img>
                        <div class="recipe__detail">
                            <ul class="ingredients--used"></ul>
                            <ul class="ingredients--missed"></ul>
                            <ul class="instructions"></ul>
                    </div>`

            $('#recipes').append(recipe);
            // console.log(recipeObj.usedIngredients, recipeObj.missedIngredients);

            renderIngredients('.ingredients--used', i, recipeObj.usedIngredients);
            renderIngredients('.ingredients--missed', i, recipeObj.missedIngredients);
        }

    }
    function renderIngredients(addTo, order, arr) {

        var l = arr.length;

        if (l > 0) {

            var list = "";

            for (var i = 0; i < l; i++) {
                list = list + `<li>${arr[i]}</li>`;
            }

            $(`${addTo}`).eq(order).append(list);
        }

    } 
    function renderSearchList(str){
    
        var arr = str.split(',');
        
        arr.forEach(function(el){
            
            var li = `<li>${el}</li>`;

            $('#searchList').append(li);

        })
    }

/**********************************/
/*              UTILITY           */
/**********************************/

    // Take only ingredient's NAME property
    function createIngArr(ingArr) {

        var newArr = ingArr.map(function (el) { return el.name });

        // delete duplicated elements
        newArr = Array.from(new Set(newArr));

        return newArr;
    }
    function resizeImg(str) {

        // Change default size(312x231) to max-size(636x393)
        return str.replace("312x231", "636x393");

    }
    function clearSearchList(){
        $('#searchList').empty();
    }

/**********************************/
/*               EVENT            */
/**********************************/

    $('#searchBtn').click(searchBtnHandler);

    // ====================================
    // ffortizn
    // PASS 2: Validate against preparation steps (note empty)
    // if not empty then populate preparation steps on object
    async function getInstructionsByRecipeId(recipeId, k) {
        var arr = [];
        var apiKey = "5aac1a10cd874816809acc6f2d2fa006";
        var queryURL = "https://api.spoonacular.com/recipes/" + recipeId + "/analyzedInstructions?apiKey=" + apiKey;

        await $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (data) {
            console.log("instructions raw data:", data);
            var i, j;
            
            // Traverse steps on response and push in an array, then return array
            for (i = 0; i < data.length; ++i)
                for (j = 0; j < data[i].steps.length; ++j)
                    arr.push(data[i].steps[j].step);


            // PASS2 : Validate/Populate
            // try catch

            // VALIDATE
            // if empty turn flag
            // if response has data then populate object

            // arr.forEach(element => {
            //     console.log(element);
            // });
            //state.recipes.push(arr);
            //state.recipes[k].instructions = arr;

            state.recipes[k].steps = arr;
            //console.log("ff" + state.recipes[k].steps);
            //return arr;
        });
    }




/********************** end **************************/
})
// Todo
    // ajax : getting data - done
    // duplicated ingredient element deleting function - done
    // image: data[i].image, data **312x231 => change to https://spoonacular.com/recipeImages/{ID}-636x393.{TYPE} - done
    // render to DOM - done
    // render used ingredients and missing ingredients to DOM - done
    // render input list to DOM - done
    // Add an instruction property to each recipe {}. format: [step1,step2,step3...] - Francisco - done

    // used & missed ingredients accuracy matter : chocolate !== semi-sweet chocolate, dark chocolate candy bars... 

    // recipe validator (*Pass only when it has instructions, less than 10 missing ingredient?)
    // change alert to modal
    // loader animation


