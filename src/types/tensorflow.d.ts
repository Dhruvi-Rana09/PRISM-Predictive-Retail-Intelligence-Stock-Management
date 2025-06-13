// types/tensorflow.d.ts
// Type declarations for TensorFlow.js and Universal Sentence Encoder

declare module '@tensorflow/tfjs' {
  export interface Tensor {
    array(): Promise<any>;
    dispose(): void;
  }
  
  export function dispose(tensors: Tensor | Tensor[]): void;
}

declare module '@tensorflow-models/universal-sentence-encoder' {
  export interface UniversalSentenceEncoder {
    embed(texts: string | string[]): Promise<{
      array(): Promise<number[][]>;
      dispose(): void;
    }>;
  }
  
  export function load(): Promise<UniversalSentenceEncoder>;
}