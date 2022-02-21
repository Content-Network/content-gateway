import 'bootstrap/dist/css/bootstrap.css';
import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./app/pages/Index";
import Wizard from "./app/pages/Wizard";

ReactDOM.render(
    <ChakraProvider>
        <StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/wizard" element={<Wizard />} />
                </Routes>
            </BrowserRouter>
        </StrictMode>
    </ChakraProvider>,
    document.getElementById("root")
);
