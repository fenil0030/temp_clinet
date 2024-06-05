import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Profiles } from 'src/app/models/profiles';
import { ProfilesService } from 'src/app/service/profiles.service';
import { AppConfirmService } from 'src/app/shared/app-confirm/app-confirm.service';
import { AppLoaderService } from 'src/app/shared/app-loader/app-loader.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profiles-detials',
  templateUrl: './profiles-detials.component.html',
  styleUrls: ['./profiles-detials.component.css']
})
export class ProfilesDetialsComponent {

  profile: Profiles = {
    id: 0,
    firstName: '',
    lastName: '',
    technology: '',
    noofYearsExperience: 0,
  }
  profileId: any;
  pageMode: string = 'add';
  _bankCardForm: FormGroup;

  allowedFileExtensions = ['jpg', 'png', 'jpeg', 'pdf', 'zip', 'xlsx', 'xls', 'xlsm', 'doc', 'csv', 'docx'];
  filePreview: string | ArrayBuffer;
  isFileFromClient: boolean = false;

  constructor(private _profilesService: ProfilesService, private router: Router, private _router: ActivatedRoute, private _formBuilder: FormBuilder,
    private confirmService: AppConfirmService,
    private snack: MatSnackBar,
    private loader: AppLoaderService
  ) {
    this.cardForm({});
  }

  ngOnInit() {
    //get by id profiles details
    this.profileId = Number(this._router.snapshot.params["id"]);
    if (this.profileId > 0) {
      this._profilesService.getById(this.profileId).subscribe({
        next: (res) => {
          this.profile = res;
          this.pageMode = "view";
        }, error: (e) => {
          console.log(e)
          alert(e.statusText)
        }
      })
    } else {
      this.profile = {
        id: 0,
        firstName: '',
        lastName: '',
        technology: '',
        noofYearsExperience: 0,
      };
      this.profileId = 0;
      this.pageMode = 'add';
    }
  }

  cardForm(args: any) {
    this._bankCardForm = this._formBuilder.group({
      id: [args.id || 0],
      firstName: [args.firstName, Validators.required],
      lastName: [args.lastName],
      cardNo: [args.cardNo, [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cvv: [args.cvv,  Validators.pattern(/^\d{3}$/)],
      cardType: [args.cardType],
      technology: [args.bankName],
      expirationDate: [args.expirationDate],
      weeklyAmountLimit: [args.weeklyAmountLimit],
      monthlyAmountLimit: [args.monthlyAmountLimit],
      noofYearsExperience: [args.noofYearsExperience || 0],
      isBlocked: [args.isBlocked],
      createdById: [0],
      modifiedById: [0],
    })
  }


  fileUpload(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        let fileName = event.target.files[0].name.split('.')[0];
        let ext = event.target.files[0].name.split('.').pop().toLowerCase(); //FileType
        if (ext) {
          if (this.allowedFileExtensions.includes(ext)) {
            // this.loaderService.isLoading.next(true);
            let size = event.target.files[0].size / 1024 / 1024;
            if (size > environment.MaxUploadLimit) {
              // Swal.fire('', `You can only upload upto ${environment.MaxUploadLimit} MB JPG, JPEG, PNG image and PDF!`, 'error');
              // this._documentRecordsForm.controls['fileName'].setValue(null);
              // this._documentRecordsForm.controls['fileType'].setValue(null);
              // this._documentRecordsForm.controls['fileBinary'].setValue(null);
              // this._documentRecordsForm.controls['isFileUploaded'].setValue(false);
              // this._documentRecordsForm.controls['fileBase64String'].setValue(null);
              this.isFileFromClient = false;
              // this.loaderService.isLoading.next(false);
            }
            else {
              var fBinary = this.convertDataURIToBinary(reader.result);
              this.filePreview = reader.result as string;
              // this._documentRecordsForm.controls['fileBase64String'].setValue(this.filePreview);
              // this._documentRecordsForm.controls['fileName'].setValue(fileName);
              // this._documentRecordsForm.controls['fileType'].setValue(ext);
              // this._documentRecordsForm.controls['fileBinary'].setValue(fBinary);
              // this._documentRecordsForm.controls['isFileUploaded'].setValue(true);
              this.isFileFromClient = true;
              // this.loaderService.isLoading.next(false);
              if (size > 10) {
                // this.toastrService.warning("The document file is too large. This may take a few minutes while saving data.", "", {
                //   positionClass: "toast-top-right",
                //   timeOut: 10000
                // });
              }
            }
          }
          else {
            // Swal.fire('', 'You can only upload JPG, JPEG, PNG image and PDF!', 'error');
            // this._documentRecordsForm.controls['fileName'].setValue(null);
            // this._documentRecordsForm.controls['fileType'].setValue(null);
            // this._documentRecordsForm.controls['fileBinary'].setValue(null);
            // this._documentRecordsForm.controls['isFileUploaded'].setValue(false);
            // this._documentRecordsForm.controls['fileBase64String'].setValue(null);
            // this.isFileFromClient = false;
            // this.loaderService.isLoading.next(false);
          }
        }
      };
    }
  }

  //insert profiles details
  addProfiles(): void {
    this.markFormTouched(this._bankCardForm);
    if (this.checkValidator())
      this._profilesService.add(this.profile).subscribe({
        next: (res) => {
          this.router.navigate(['/list']);
        }, error: (e) => alert(e.statusText)
      })
  }

  checkValidator(): boolean {
    if (this.profile.firstName == null || this.profile.firstName == undefined || this.profile.firstName == '') {
      alert('Please enter first name');
      return false;
    }
    if (this.profile.lastName == null || this.profile.lastName == undefined || this.profile.lastName == '') {
      alert('Please enter last name');
      return false;
    }
    if (this.profile.technology == null || this.profile.technology == undefined || this.profile.technology == '') {
      alert('Please enter technology');
      return false;
    }
    if (this.profile.noofYearsExperience == null || this.profile.noofYearsExperience == undefined || this.profile.noofYearsExperience == 0) {
      alert('Number of Years Experience is required');
      return false;
    }
    return true
  }

  markFormTouched(group: FormGroup | FormArray | any) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.controls[key];
      if (control instanceof FormGroup || control instanceof FormArray) { control.markAsTouched(); this.markFormTouched(control); }
      else { control.markAsTouched(); };
    });
  };

  convertDataURIToBinary(dataURI) {
    let BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    return base64;
  }


  // DownloadDocument(val, modelContent = null) {
  //   if (val && this.isFileFromClient) {
  //     const link = document.createElement('a');
  //     link.setAttribute('target', '_blank');
  //     link.setAttribute('href', val.fileBase64String);
  //     link.setAttribute('download', `${val.fileName}.${val.fileType}`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   }
  //   else if (val && val.id > 0) {
  //     this.loaderService.isLoading.next(true);
  //     this._documentRecordsService.getDocumentRecordsById(val.id)
  //       .pipe(takeUntil(this._unsubscribeAll))
  //       .subscribe((res: any) => {
  //         if (res != null && Object.keys(res).length !== 0) {

  //           if (res.fileType) {
  //             let _allowedFileExtensions = ['jpg', 'png', 'jpeg'];

  //             if (_allowedFileExtensions.includes(res.fileType) && modelContent != null) {
  //               this.isImage = true;
  //               this.isPdf = false;
  //               this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(res.fileBase64String);
  //               this.modalService.open(modelContent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'myCustomModalClass' }).result.then((result) => {
  //                 this.downloadFile(res);
  //               }, (reason) => {
  //                 this.isImage = false;
  //                 this.isPdf = false;
  //                 this.previewUrl = null;
  //               });

  //             } else if (res.fileType === 'pdf' && modelContent != null) {
  //               this.isPdf = true;
  //               this.isImage = false;
  //               this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.fileBase64String);
  //               this.modalService.open(modelContent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'myCustomModalClass' }).result.then((result) => {
  //                 this.downloadFile(res);
  //               }, (reason) => {
  //                 this.isImage = false;
  //                 this.isPdf = false;
  //                 this.previewUrl = null;
  //               });
  //             } else {
  //               // Handle other file types here
  //               this.downloadFile(res);
  //             }
  //           }

  //         }
  //         this.loaderService.isLoading.next(false);
  //         this._changeDetectorRef.markForCheck();
  //       }, (err: any) => {
  //         this.loaderService.isLoading.next(false);
  //         this._changeDetectorRef.markForCheck();
  //       });
  //   }
  // }

  // private downloadFile(args) {
  //   const link = document.createElement('a');
  //   link.setAttribute('target', '_blank');
  //   link.setAttribute('href', args.fileBase64String);
  //   link.setAttribute('download', `${args.fileName}.${args.fileType}`);
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  //   this.isImage = false;
  //   this.isPdf = false;
  //   this.previewUrl = null;
  // }

  addProfiles1(){
    this.loader.open();

    setTimeout(() => {
      this.loader.close();
    }, 5000);
  }
  addProfiles2(){
    this.snack.open('message', 'OK', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  addProfiles3(){
    this.confirmService.confirm({ message: `` })
    .subscribe(res => {
      if (res) {
        alert('confirm worked')
      }
    });
  }
}
