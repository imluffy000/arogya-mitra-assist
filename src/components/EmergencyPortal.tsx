
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Phone, Clock, AlertTriangle, Ambulance, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmergencyPortalProps {
  onBack: () => void;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

const EmergencyPortal = ({ onBack }: EmergencyPortalProps) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);

  const emergencyTypes = [
    'Heart Attack',
    'Stroke',
    'Severe Injury',
    'Breathing Problems',
    'Unconsciousness',
    'Severe Bleeding',
    'Poisoning',
    'Burns',
    'Other Medical Emergency'
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Simulate reverse geocoding (in real app, use Google Maps API or similar)
            const address = await reverseGeocode(latitude, longitude);
            
            setLocation({
              latitude,
              longitude,
              address
            });
            
            toast({
              title: "Location Found",
              description: "Your location has been detected successfully.",
            });
          } catch (error) {
            console.error('Error getting address:', error);
            setLocation({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            });
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter your address manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter your address manually.",
        variant: "destructive"
      });
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simulate reverse geocoding - in real app, use actual API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Near ${lat.toFixed(3)}, ${lng.toFixed(3)} - Location detected`);
      }, 1000);
    });
  };

  const handleEmergencyCall = () => {
    if (!patientName || !contactNumber || !emergencyType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before calling emergency services.",
        variant: "destructive"
      });
      return;
    }

    setIsEmergencyActive(true);
    
    // Simulate emergency response
    const arrivalTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
    setEstimatedArrival(arrivalTime);
    
    toast({
      title: "Emergency Services Contacted",
      description: `Ambulance dispatched! ETA: ${arrivalTime} minutes`,
    });

    // Simulate real emergency call
    console.log('Emergency Call Details:', {
      patientName,
      contactNumber,
      emergencyType,
      emergencyDetails,
      location,
      timestamp: new Date().toISOString()
    });
  };

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false);
    setEstimatedArrival(null);
    toast({
      title: "Emergency Cancelled",
      description: "Emergency services have been notified of cancellation.",
    });
  };

  if (isEmergencyActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="border-red-200">
            <CardHeader className="bg-red-600 text-white text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Ambulance className="h-8 w-8" />
                Emergency Active
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Ambulance Dispatched
                </h2>
                <p className="text-gray-600">
                  Emergency services have been contacted and are on their way.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">
                    Estimated Arrival Time
                  </span>
                </div>
                <div className="text-3xl font-bold text-yellow-800">
                  {estimatedArrival} minutes
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Patient Info</h3>
                  <p className="text-sm text-gray-600">Name: {patientName}</p>
                  <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
                  <p className="text-sm text-gray-600">Emergency: {emergencyType}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                  <p className="text-sm text-gray-600 flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    {location?.address || 'Location unavailable'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleCancelEmergency}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancel Emergency
                </Button>
                <Button
                  onClick={onBack}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Back to Home
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Emergency ID: EM-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Keep this ID for reference
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Emergency Portal</span>
          </div>
        </div>

        <Card className="border-red-200">
          <CardHeader className="bg-red-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-6 w-6" />
              Emergency Ambulance Service
            </CardTitle>
            <p className="text-red-100 text-sm">
              Fill out the form below for immediate medical assistance
            </p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-700">
                Your Location
              </Label>
              
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Current Location</span>
                </div>
                
                {isGettingLocation ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    Getting your location...
                  </div>
                ) : location ? (
                  <div>
                    <p className="text-sm text-gray-600">{location.address}</p>
                    <p className="text-xs text-gray-500">
                      Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600 mb-2">Location not available</p>
                    <Button
                      onClick={getCurrentLocation}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Location
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-700">
                Patient Information
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient's full name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter contact number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Type */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-700">
                Type of Emergency *
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {emergencyTypes.map((type) => (
                  <Button
                    key={type}
                    variant={emergencyType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmergencyType(type)}
                    className={`h-auto p-3 text-xs ${
                      emergencyType === type 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Emergency Details */}
            <div className="space-y-4">
              <Label htmlFor="emergencyDetails" className="text-lg font-semibold text-gray-700">
                Additional Details
              </Label>
              <Textarea
                id="emergencyDetails"
                value={emergencyDetails}
                onChange={(e) => setEmergencyDetails(e.target.value)}
                placeholder="Describe the emergency situation, symptoms, or any other relevant information..."
                className="min-h-[100px]"
              />
            </div>

            {/* Emergency Button */}
            <div className="pt-4">
              <Button
                onClick={handleEmergencyCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
                size="lg"
              >
                <Phone className="h-6 w-6 mr-2" />
                Call Emergency Services Now
              </Button>
              
              <p className="text-center text-sm text-gray-500 mt-2">
                By clicking this button, emergency services will be contacted immediately
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyPortal;
