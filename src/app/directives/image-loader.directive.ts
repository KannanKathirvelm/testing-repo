import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { NetworkService } from '@app/providers/service/network.service';
import { CollectionPlayerService } from '@app/providers/service/player/collection-player.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Directive({
    selector: '[imageLoader]'
})

export class ImageLoaderDirective implements OnInit, OnDestroy {
    // -------------------------------------------------------------------------
    // Properties
    @Input() public collectionId: string;
    @Input() public resourceId: string;
    @Input() public url: string;
    public isOnline: boolean;
    public networkSubscription: AnonymousSubscription;

    // -------------------------------------------------------------------------
    // Dependency Injection
    constructor(
        private networkService: NetworkService,
        private collectionPlayerService: CollectionPlayerService,
        private utilsService: UtilsService,
        private el: ElementRef
    ) {
        this.networkSubscription = this.networkService.onNetworkChange().subscribe(async () => {
            this.isOnline = await this.utilsService.isNetworkOnline();
            if (!this.isOnline) {
                this.isOnlineStatus();
            }
        });
    }

    // -------------------------------------------------------------------------
    // Events
    public ngOnInit() {
        this.isOnlineStatus();
    }

    public ngOnDestroy() {
        this.networkSubscription.unsubscribe();
    }

    /**
     * @function isOnlineStatus
     * This method is used to get the online status and render the offline media
     */
    public async isOnlineStatus() {
        const media = await this.collectionPlayerService.getOfflineResourceContent(this.collectionId, this.resourceId);
        this.el.nativeElement.src = this.isOnline ? this.url : media.fileUrlPath;
    }
}