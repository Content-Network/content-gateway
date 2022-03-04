import * as t from "io-ts";
import { DataLoaderBase } from "./DataLoaderBase";

export abstract class CodecDataLoaderBase<R, T> extends DataLoaderBase<R, T> {
    protected abstract codec: t.Type<R>;
}
