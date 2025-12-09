/* eslint-disable @typescript-eslint/naming-convention -- This is what we get.*/
export interface Appeal {
  id:              number;
  manualSort:      number;
  Discord_ID:      string;
  Username:        string;
  Code_of_Conduct: boolean;
  Reason:          string;
  Fairness:        string;
  Improvement:     string;
}
