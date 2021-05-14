import React, {useEffect, useState} from 'react';
import firebase from "../../base";
import history from "../../history";
import {AddedContainer, AddedRecipesContainer, Choose, ChooseContainer, ChosenHeader} from "./AddedByUser.styles";
import {Navigation, Previous} from "../App/App.styles";
import Recipe from "../App/Recipe/Recipe";
import Modal from "../App/Modal/Modal";
import AddRecipe from "../AddRecipe/AddRecipe";
const AddedByUser = ({user}) => {
    const [addedByUser, setAddedByUser] = useState([]);
    const [premade, setPremade] = useState([]);
    const [modal, setModal] = useState({
        title: "",
        requiredIngredients: [],
        additionalIngredients: [],
        image: "",
        instructions: ""
    })
    const[editRecipe,setEditRecipe] = useState({});
    const [chosen, setChosen] = useState("wszystkie");
    useEffect(() => {
        setAddedByUser([]);
        const recipesRef = firebase.database().ref(`Users/${user.uid}/Recipes`);
        recipesRef.on("value", (snapshot) => {
            const recipes = snapshot.val();
            for (let id in recipes) {
                setAddedByUser(prevState => [...prevState, {ID: id, added: recipes[id]}])
            }
        })
        setPremade([]);
        const premadeRef = firebase.database().ref(`Users/${user.uid}/PremadeRecipes`);
        premadeRef.on("value",(snapshot)=>{
            const recipes = snapshot.val();
            for(let id in recipes){
                setPremade(prevState=>[...prevState,{ID:id, added:recipes[id]}])
            }
        })
    }, [])
    const showModal = (title, requiredIngredients, additionalIngredients, instructions, image) => {
        if (additionalIngredients !== undefined) {
            setModal({
                title,
                requiredIngredients,
                additionalIngredients,
                instructions,
                image
            })
        } else {
            setModal({
                title,
                requiredIngredients,
                additionalIngredients: [],
                instructions,
                image
            })
        }
    }
    const handleRemove = (id) => {
        const addedRecipeRef = firebase.database().ref(`Users/${user.uid}/Recipes`).child(id);
        addedRecipeRef.remove();
        setAddedByUser(addedByUser.filter(el => el.ID !== id));
    }
    const handleFavourite = (ID, favourite) => {
        setAddedByUser([]);
        firebase.database().ref(`Users/${user.uid}/Recipes`).child(ID).update({
            favourite: !favourite
        })
    }
    const handlePremadeFavorite = (ID, favourite) => {
        setPremade([]);
        firebase.database().ref(`Users/${user.uid}/PremadeRecipes`).child(ID).update({
            favourite:!favourite
        })
    }
    const handleChoose = (which) => {
        setChosen(which);
    }
    const handleEdit = (id) =>{
        const editRef = firebase.database().ref(`Users/${user.uid}/Recipes`);
        editRef.on("value", (snapshot) => {
            const recipe = snapshot.val();
            setEditRecipe({ID:id,recipe:recipe[Object.keys(recipe).filter(el=>el===id)]});
        })
    }
    const saveEdited = () => {
        setEditRecipe({});
        setAddedByUser([]);
        const recipesRef = firebase.database().ref(`Users/${user.uid}/Recipes`);
        recipesRef.on("value", (snapshot) => {
            const recipes = snapshot.val();
            for (let id in recipes) {
                setAddedByUser(prevState => [...prevState, {ID: id, added: recipes[id]}])
            }
        })
    }
    return (
        <AddedContainer>
            {Object.keys(editRecipe).length > 0 ? <AddRecipe  user={user} reqprop={editRecipe.recipe.requiredIngredients} ingrprop={[]} nameprop={editRecipe.recipe.title} descprop={editRecipe.recipe.details} instrprop={editRecipe.recipe.instructions} imgprop={editRecipe.recipe.image} edit={true} id={editRecipe.ID} saveEdited={saveEdited}/> :
            <>
            <Navigation>
                <Previous onClick={() => {
                    history.push("/app")
                    window.location.reload(true);
                }}/>
            </Navigation>
            <ChooseContainer>
                <Choose onClick={() => handleChoose("wszystkie")}>Wszystkie</Choose>
                <Choose onClick={() => handleChoose("twoje")}>Twoje</Choose>
                <Choose onClick={() => handleChoose("ulubione")}>Ulubione</Choose>
            </ChooseContainer>
            <AddedRecipesContainer>
                <ChosenHeader>
                    {chosen}
                </ChosenHeader>
                {chosen === "ulubione" ? addedByUser.filter(el=>el.added.favourite===true).map(el => {
                        return (
                            <Recipe title={el.added.title} details={el.added.details}
                                    requiredIngredients={el.added.requiredIngredients}
                                    additionalIngredients={el.added.additionalIngredients} image={el.added.image}
                                    instructions={el.added.instructions} favourite={el.added.favourite}
                                    showModal={showModal} id={el.ID} remove={true} makeFavourite={handleFavourite}
                                    removeRecipe={handleRemove} edit={true} handleEdit={handleEdit}/>
                        )
                }) :null }
                {chosen === "ulubione" ? premade.filter(el=>el.added.favourite===true).map(el=>{
                    return (
                        <Recipe title={el.added.title} details={el.added.details}
                                requiredIngredients={el.added.requiredIngredients}
                                additionalIngredients={el.added.additionalIngredients} image={el.added.image}
                                instructions={el.added.instructions} favourite={el.added.favourite}
                                showModal={showModal} id={el.ID} remove={false} makeFavourite={handlePremadeFavorite}
                                removeRecipe={handleRemove}/>
                    )
                }): null}
                {chosen === "wszystkie" ? premade.map(el=>{
                    return(
                        <Recipe title={el.added.title} details={el.added.details}
                                    requiredIngredients={el.added.requiredIngredients}
                                    additionalIngredients={el.added.additionalIngredients} image={el.added.image}
                                    instructions={el.added.instructions} favourite={el.added.favourite}
                                    showModal={showModal} id={el.ID} remove={false} makeFavourite={handlePremadeFavorite}
                                    removeRecipe={handleRemove}/>
                    )
                }) : null}
                {chosen === "wszystkie" ? addedByUser.map(el=>{
                    return(
                        <Recipe title={el.added.title} details={el.added.details}
                                    requiredIngredients={el.added.requiredIngredients}
                                    additionalIngredients={el.added.additionalIngredients} image={el.added.image}
                                    instructions={el.added.instructions} favourite={el.added.favourite}
                                    showModal={showModal} id={el.ID} remove={true} makeFavourite={handleFavourite}
                                    removeRecipe={handleRemove} edit={true} handleEdit={handleEdit}/>
                    )
                }) : null}
                {chosen === "twoje" ? addedByUser.map(el=>{
                    return(
                         <Recipe title={el.added.title} details={el.added.details}
                requiredIngredients={el.added.requiredIngredients}
                additionalIngredients={el.added.additionalIngredients} image={el.added.image}
                instructions={el.added.instructions} favourite={el.added.favourite}
                showModal={showModal} id={el.ID} remove={true} makeFavourite={handleFavourite}
                removeRecipe={handleRemove} edit={true} handleEdit={handleEdit}/>
)
                }) : null}
            </AddedRecipesContainer>
            {modal.requiredIngredients.length > 0 ?
                <Modal clearModal={showModal} title={modal.title} requiredIngredients={modal.requiredIngredients}
                       additionalIngredients={modal.additionalIngredients} img={modal.image}
                       instructions={modal.instructions}/> : null}
                       </>
             }
        </AddedContainer>
    )
};

export default AddedByUser