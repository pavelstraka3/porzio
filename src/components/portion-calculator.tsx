import { useEffect, useState } from 'react'
import { Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'

// Types for our application
type Ingredient = {
  id?: string
  name: string
  quantity: string
  unit: string
  calories: string
  protein: string
  carbs: string
  fat: string
  searchQuery?: string
}

type NutritionData = {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
}

export default function PortionCalculator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      name: '',
      quantity: '',
      unit: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  ])
  const [originalPortions, setOriginalPortions] = useState(4)
  const [desiredPortions, setDesiredPortions] = useState(4)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NutritionData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState<
    number | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Mock function to simulate API call for ingredient search
  // In a real app, this would be replaced with an actual API call
  const searchIngredients = async (query: string): Promise<NutritionData[]> => {
    setIsSearching(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - in a real app, this would come from the API
    const mockResults: NutritionData[] = [
      {
        name: `${query} - Chicken Breast`,
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        servingSize: 100,
        servingUnit: 'g',
      },
      {
        name: `${query} - Brown Rice`,
        calories: 112,
        protein: 2.6,
        carbs: 23.5,
        fat: 0.9,
        servingSize: 100,
        servingUnit: 'g',
      },
      {
        name: `${query} - Avocado`,
        calories: 160,
        protein: 2,
        carbs: 8.5,
        fat: 14.7,
        servingSize: 100,
        servingUnit: 'g',
      },
    ]

    setIsSearching(false)
    return mockResults
  }

  // Effect for searching ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      if (debouncedSearchQuery.length > 2) {
        const results = await searchIngredients(debouncedSearchQuery)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }

    fetchIngredients()
  }, [debouncedSearchQuery])

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: '',
        quantity: '',
        unit: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      },
    ])
  }

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  const selectIngredientFromSearch = (nutritionData: NutritionData) => {
    if (selectedIngredientIndex !== null) {
      const newIngredients = [...ingredients]
      newIngredients[selectedIngredientIndex] = {
        name: nutritionData.name,
        quantity: '100', // Default to the serving size
        unit: nutritionData.servingUnit,
        calories: nutritionData.calories.toString(),
        protein: nutritionData.protein.toString(),
        carbs: nutritionData.carbs.toString(),
        fat: nutritionData.fat.toString(),
      }
      setIngredients(newIngredients)
      setIsDialogOpen(false)
      setSearchQuery('')
    }
  }

  const openSearchDialog = (index: number) => {
    setSelectedIngredientIndex(index)
    setIsDialogOpen(true)
  }

  const calculateAdjustedValue = (value: string) => {
    if (!value) return ''
    const numericValue = Number.parseFloat(value)
    if (isNaN(numericValue)) return value

    const ratio = desiredPortions / originalPortions
    const adjusted = numericValue * ratio

    // Format to at most 2 decimal places, but avoid trailing zeros
    return adjusted
      .toLocaleString('en-US', {
        maximumFractionDigits: 2,
        useGrouping: false,
      })
      .replace(/\.0+$/, '')
  }

  const calculateTotalNutrition = (
    nutrient: keyof Ingredient,
    forAdjusted = false,
  ) => {
    return ingredients.reduce((total, ingredient) => {
      if (!ingredient[nutrient] || !ingredient.quantity) return total

      const nutrientValue = Number.parseFloat(ingredient[nutrient] as string)
      const quantity = Number.parseFloat(ingredient.quantity)

      if (isNaN(nutrientValue) || isNaN(quantity)) return total

      // Calculate based on the entered quantity relative to 100g/ml standard
      const standardServing = 100
      const ratio = forAdjusted ? desiredPortions / originalPortions : 1
      return total + ((nutrientValue * quantity) / standardServing) * ratio
    }, 0)
  }

  const formatNutritionValue = (value: number) => {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Advanced Portion Calculator
      </h1>

      <div className="grid gap-8">
        {/* Ingredient Input Area */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-3 sm:col-span-3">
                    <div className="flex gap-1">
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, 'name', e.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openSearchDialog(index)}
                        className="flex-shrink-0"
                      >
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search ingredient</span>
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Qty"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(index, 'quantity', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, 'unit', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Cal"
                      value={ingredient.calories}
                      onChange={(e) =>
                        updateIngredient(index, 'calories', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Prot"
                      value={ingredient.protein}
                      onChange={(e) =>
                        updateIngredient(index, 'protein', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Carbs"
                      value={ingredient.carbs}
                      onChange={(e) =>
                        updateIngredient(index, 'carbs', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Fat"
                      value={ingredient.fat}
                      onChange={(e) =>
                        updateIngredient(index, 'fat', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Remove ingredient</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 flex items-center gap-1"
              onClick={addIngredient}
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </CardContent>
        </Card>

        {/* Portions Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Original Recipe Yields</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="originalPortions"
                type="number"
                min="1"
                placeholder="e.g., 4"
                value={originalPortions}
                onChange={(e) =>
                  setOriginalPortions(
                    Math.max(1, Number.parseInt(e.target.value) || 1),
                  )
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Desired Portions</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="desiredPortions"
                type="number"
                min="1"
                max="20"
                value={desiredPortions}
                onChange={(e) =>
                  setDesiredPortions(
                    Math.max(1, Number.parseInt(e.target.value) || 1),
                  )
                }
                className="mb-2"
              />
              <Slider
                value={[desiredPortions]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => setDesiredPortions(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Display Area */}
        <Tabs defaultValue="ingredients">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Adjusted Ingredients</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <Card>
              <CardContent className="pt-6">
                {ingredients.some((ing) => ing.name && ing.quantity) ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead className="text-right">Original</TableHead>
                        <TableHead className="text-right">Adjusted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredients.map((ingredient, index) =>
                        ingredient.name && ingredient.quantity ? (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {ingredient.name}
                            </TableCell>
                            <TableCell className="text-right">
                              {ingredient.quantity} {ingredient.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {calculateAdjustedValue(ingredient.quantity)}{' '}
                              {ingredient.unit}
                            </TableCell>
                          </TableRow>
                        ) : null,
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground italic text-center py-6">
                    Enter ingredients with quantities above to see calculations
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Original Recipe
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nutrient</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">
                            Per Serving
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Calories</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('calories'),
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('calories') /
                              originalPortions,
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Protein</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('protein'),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('protein') /
                              originalPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Carbs</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('carbs'),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('carbs') /
                              originalPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Fat</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('fat'),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('fat') / originalPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Adjusted Recipe
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nutrient</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">
                            Per Serving
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Calories</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('calories', true),
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('calories', true) /
                              desiredPortions,
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Protein</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('protein', true),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('protein', true) /
                              desiredPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Carbs</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('carbs', true),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('carbs', true) /
                              desiredPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Fat</TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('fat', true),
                            )}
                            g
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNutritionValue(
                              calculateTotalNutrition('fat', true) /
                              desiredPortions,
                            )}
                            g
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-2">
                    Macronutrient Distribution
                  </h3>
                  <div className="flex gap-2 justify-center mt-4">
                    {calculateTotalNutrition('calories', true) > 0 ? (
                      <>
                        <Badge className="px-3 py-1 text-sm bg-primary text-primary-foreground">
                          Protein:{' '}
                          {Math.round(
                            ((calculateTotalNutrition('protein', true) * 4) /
                              calculateTotalNutrition('calories', true)) *
                            100,
                          )}
                          %
                        </Badge>
                        <Badge className="px-3 py-1 text-sm bg-secondary text-secondary-foreground">
                          Carbs:{' '}
                          {Math.round(
                            ((calculateTotalNutrition('carbs', true) * 4) /
                              calculateTotalNutrition('calories', true)) *
                            100,
                          )}
                          %
                        </Badge>
                        <Badge className="px-3 py-1 text-sm bg-accent text-accent-foreground">
                          Fat:{' '}
                          {Math.round(
                            ((calculateTotalNutrition('fat', true) * 9) /
                              calculateTotalNutrition('calories', true)) *
                            100,
                          )}
                          %
                        </Badge>
                      </>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Add ingredients with nutritional data to see
                        macronutrient distribution
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ingredient Search Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Ingredients</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search for an ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isSearching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Cal</TableHead>
                      <TableHead className="text-right">P/C/F</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => selectIngredientFromSearch(result)}
                      >
                        <TableCell>{result.name}</TableCell>
                        <TableCell className="text-right">
                          {result.calories}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.protein}g/{result.carbs}g/{result.fat}g
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isSearching &&
              searchQuery.length > 2 &&
              searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No ingredients found. Try a different search term.
                </p>
              )}

            {!isSearching && searchQuery.length <= 2 && (
              <p className="text-center text-muted-foreground py-4">
                Type at least 3 characters to search
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
