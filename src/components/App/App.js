import React, {useState, useEffect} from 'react';
import {
    AddedByUser, LogOut,
    MainHeader,
    MainSection,
    Navigation,
    PickerContainer,
    Previous,
    Search,
    Wrapper
} from "./App.styles";
import {Next} from "../Home/Home.styles";
import Ingredients from "./Ingredients/Ingredients";
import Picker from "./Picker/Picker";
import Recipe from "./Recipe/Recipe";
import ChosenIngredients from "./ChosenIngredients/ChosenIngredients";
import firebase from "../../base.js";
import history from "../../history";
import Modal from "./Modal/Modal";
const initialState=[]
const App = ({user,handleLogout}) => {
    const [ingredients,setIngredients] = useState(initialState);
    const [recipes,setRecipes] = useState([]);
    const [chosenIngredients,setChosenIngredients] = useState([]);
    const [searchedRecipes,setSearchedRecipes] = useState([]);
    const [modal,setModal] = useState({
        title:"",
        requiredIngredients:[],
        additionalIngredients:[],
        instructions:"",
        image:""
    })
    useEffect(()=>{
        setRecipes([]);
        const recipesRef = firebase.database().ref(`Users/${user.uid}/Recipes`);
        recipesRef.on("value",(snapshot)=>{
            const addedRecipes = snapshot.val();
            for(let id in addedRecipes){
                setRecipes(prevState => [...prevState,{ID:id,recipe:addedRecipes[id]}])
            }
        })
    },[])
    const handleClick = (data) => {
        setIngredients(initialState);
        setIngredients([...data])
    }
    const handleChoseIng = (ing) => {
        if (chosenIngredients.filter(el => el !== ing).length < chosenIngredients.length) {
            setChosenIngredients(chosenIngredients.filter(el => el !== ing));
        } else {
            setChosenIngredients(prevState => [...prevState, ing]);
        }
        setSearchedRecipes([]);
    }
    const handleDeleteIngredient = (element) =>{
        setChosenIngredients(chosenIngredients.filter(el=>el!==element));
        setSearchedRecipes([]);
    }
    const handleCheck = () =>{
        setSearchedRecipes([])
        let clicker = 0;
        for(let i = 0; i < recipes.length; i++) {
            for(let j = 0 ; j < chosenIngredients.length; j++){
                for(let k = 0 ; k < recipes[i].recipe.requiredIngredients.length;k++){
                    if(chosenIngredients.sort()[j]==recipes[i].recipe.requiredIngredients.sort()[k]){
                        clicker++;
                        if(clicker == recipes[i].recipe.requiredIngredients.length){
                            setSearchedRecipes(prevState=>[...prevState,recipes[i]]);
                            clicker = 0;
                        }
                    }
                }
            }
        }
    }
    const showModal = (title,requiredIngredients,additionalIngredients,instructions,image) =>{
        if(additionalIngredients!==undefined){
            setModal({
                title,
                requiredIngredients,
                additionalIngredients,
                instructions,
                image
            })
        }else{
            setModal({
                title,
                requiredIngredients,
                additionalIngredients:[],
                instructions,
                image
            })
        }

    }
    const handleFavourite = (ID,favourite) => {
        firebase.database().ref(`Users/${user.uid}/Recipes`).child(ID).update({
            favourite:!favourite
        })
        console.log(favourite)
    }
    return (
        <Wrapper>
            <Navigation>
                <LogOut onClick={handleLogout}>
                    Wyloguj
                </LogOut>
                <AddedByUser onClick={()=>{
                    history.push("/all-recipes");
                    window.location.reload(true);
                }}>
                    Wszystkie przepisy
                </AddedByUser>
                <Next onClick={()=>{
                    history.push("/add-new")
                    window.location.reload(true);
                }}/>
            </Navigation>
            <MainSection>
                <MainHeader>
                    Co masz w lodówce?
                </MainHeader>
                <PickerContainer>
                    <Picker handleClick={handleClick}/>
                </PickerContainer>
                {ingredients.length>0 ? <Ingredients ingredients={ingredients} handleChoseIng={handleChoseIng}/> : null}
                {chosenIngredients.length > 0 ? <ChosenIngredients chosen={chosenIngredients} deleteChosen={handleDeleteIngredient}/> : null}
                {chosenIngredients.length > 0 ? <Search onClick={handleCheck}>Szukaj!</Search>: null}
                {searchedRecipes.length > 0 ? searchedRecipes.map(el=>(<Recipe title={el.recipe.title} details={el.recipe.details} requiredIngredients={el.recipe.requiredIngredients} additionalIngredients={el.recipe.additionalIngredients} image={el.recipe.image} instructions={el.recipe.instructions} favourite={el.recipe.favourite} showModal={showModal} id={el.ID}  remove={false} makeFavourite={handleFavourite}/>)) : null}
            </MainSection>
            {modal.requiredIngredients.length > 0 ? <Modal clearModal={showModal} title={modal.title} requiredIngredients={modal.requiredIngredients} additionalIngredients={modal.additionalIngredients} img={modal.image} instructions={modal.instructions}/> : null}
        </Wrapper>
    )
};
export default App