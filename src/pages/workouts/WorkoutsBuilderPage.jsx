import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import "./WorkoutsBuilderPage.css";

// Dummy data used, connect to db later//

const EXCERCISE_LIBRARY = [
    { id: "ex1", name: "Bench Press (Barbell)" },
    { id: "ex2", name: "Dumbell Curl" },
    { id: "ex3", name: "Seated Cable Row" },
    { id: "ex4", name: "Lat Pulldown" },
    { id: "ex5", name: "Shoulder Press" },
];


export default function WorkoutsBuilderPage() {
    return <h1>WorkoutBuilder</h1>;
}