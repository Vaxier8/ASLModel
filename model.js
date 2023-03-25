
export async function loadModelAndPredict(inputData) { 
    // Replace the path with the actual path to your model.json file 
    const modelUrl = "./model.json";

    // Load the model 
    const model = await tf.loadLayersModel(modelUrl);
    
    // Prepare the input data 
    // inputData should be an array or a tensor with the shape your model expects 
    const input = tf.tensor(inputData);
    
    // Make a prediction using the model 
    const prediction = model.predict(input);
    
    // Convert the prediction to a JavaScript array 
    const predictionArray = await prediction.array();
    
    // Log the prediction to the console 
    console.log("Prediction:", predictionArray);
    
    // Don't forget to dispose the tensors to avoid memory leaks 
    input.dispose(); 
    prediction.dispose(); 
}