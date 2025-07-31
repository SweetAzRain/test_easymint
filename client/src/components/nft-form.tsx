import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Hammer, Plus, Minus } from "lucide-react";
import type { NFTFormData } from "@/pages/mint";

interface NFTFormProps {
  formData: NFTFormData;
  onChange: (data: NFTFormData) => void;
  onMint: () => void;
  isValid: boolean;
  isProcessing: boolean;
}

export function NFTForm({ formData, onChange, onMint, isValid, isProcessing }: NFTFormProps) {
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleTitleChange = (value: string) => {
    if (value.length > 32) return;
    
    onChange({ ...formData, title: value });
    setTitleError(value.trim() ? "" : "Title is required");
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length > 256) return;
    
    onChange({ ...formData, description: value });
    setDescriptionError(value.trim() ? "" : "Description is required");
  };

  const addProperty = () => {
    onChange({
      ...formData,
      properties: [...formData.properties, { name: "", value: "" }]
    });
  };

  const removeProperty = (index: number) => {
    onChange({
      ...formData,
      properties: formData.properties.filter((_, i) => i !== index)
    });
  };

  const updateProperty = (index: number, field: 'name' | 'value', value: string) => {
    const newProperties = [...formData.properties];
    newProperties[index][field] = value;
    onChange({ ...formData, properties: newProperties });
  };

  const getTitleCounterClass = () => {
    const length = formData.title.length;
    if (length > 28) return "text-xs text-warning";
    return "text-xs text-gray-500";
  };

  const getDescriptionCounterClass = () => {
    const length = formData.description.length;
    if (length > 240) return "text-xs text-warning";
    return "text-xs text-gray-500";
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <Edit className="text-primary" size={20} />
            <span>NFT Details</span>
          </h2>

          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <Label htmlFor="nft-title" className="text-sm font-medium text-gray-300 mb-2 block">
                Title <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nft-title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter NFT title..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 pr-16"
                />
                <div className="absolute right-3 top-3">
                  <span className={getTitleCounterClass()}>
                    {formData.title.length}/32
                  </span>
                </div>
              </div>
              {titleError && (
                <p className="text-xs text-red-400 mt-1">{titleError}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="nft-description" className="text-sm font-medium text-gray-300 mb-2 block">
                Description <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="nft-description"
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Describe your NFT..."
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 resize-none pr-16"
                />
                <div className="absolute right-3 bottom-3">
                  <span className={getDescriptionCounterClass()}>
                    {formData.description.length}/256
                  </span>
                </div>
              </div>
              {descriptionError && (
                <p className="text-xs text-red-400 mt-1">{descriptionError}</p>
              )}
            </div>

            {/* Properties */}
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2 block">
                Properties <span className="text-gray-500">(Optional)</span>
              </Label>
              <div className="space-y-3">
                {formData.properties.map((property, index) => (
                  <div key={index} className="flex space-x-3">
                    <Input
                      placeholder="Property name"
                      value={property.name}
                      onChange={(e) => updateProperty(index, 'name', e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm"
                    />
                    <Input
                      placeholder="Value"
                      value={property.value}
                      onChange={(e) => updateProperty(index, 'value', e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 p-2"
                      onClick={() => removeProperty(index)}
                    >
                      <Minus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 text-primary hover:text-primary/80 text-sm"
                onClick={addProperty}
              >
                <Plus className="mr-1" size={16} />
                Add Property
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mint Button */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <Button
            onClick={onMint}
            disabled={!isValid || isProcessing}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 transition-all duration-200"
          >
            <Hammer className="mr-3" size={16} />
            {isProcessing ? "Minting..." : "Mint NFT"}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By minting, you agree to pay the storage deposit and transaction fees
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
