import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./app/pages/Index";
import Schemas from "./app/pages/Schemas";

ReactDOM.render(
    <ChakraProvider>
        <StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/schemas" element={<Schemas />} />
                </Routes>
            </BrowserRouter>
        </StrictMode>
    </ChakraProvider>,
    document.getElementById("root")
);
