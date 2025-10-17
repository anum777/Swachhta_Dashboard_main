from sklearn.metrics import accuracy_score

def calculate_model_accuracy(y_true, y_pred):
    """
    Calculate the accuracy of a model.

    Parameters:
    y_true (list or array): True labels.
    y_pred (list or array): Predicted labels.

    Returns:
    float: Accuracy of the model.
    """
    return accuracy_score(y_true, y_pred)

# Example usage
if __name__ == "__main__":
    # Example: Replace these with your actual true and predicted labels
    y_true = [1, 0, 1, 1, 0, 1]
    y_pred = [1, 0, 1, 0, 0, 1]
    
    # Specify the model being evaluated
    model_name = "Example Model (e.g., Logistic Regression, Decision Tree, etc.)"
    print(f"Evaluating accuracy for: {model_name}")
    
    accuracy = calculate_model_accuracy(y_true, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
